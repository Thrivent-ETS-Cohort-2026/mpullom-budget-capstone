package com.project.budget.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.budget.dto.AccountTransferRequest;
import com.project.budget.dto.BudgetTransferRequest;
import com.project.budget.dto.TransactionRequest;
import com.project.budget.model.Account;
import com.project.budget.model.Transaction;
import com.project.budget.model.TransactionType;
import com.project.budget.model.User;
import com.project.budget.repository.AccountRepository;
import com.project.budget.repository.TransactionRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final AccountRepository accounts;
    private final BudgetService budgetService;
    private final UserService userService;
    private final AccountService accountService;

    public TransactionService(
            TransactionRepository transactions,
            AccountRepository accounts,
            BudgetService budgetService,
            UserService userService,
            AccountService accountService) {
        this.transactions = transactions;
        this.accounts = accounts;
        this.budgetService = budgetService;
        this.userService = userService;
        this.accountService = accountService;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByAccountNum(String token, Long accountNumber) {
        User authenticatedUser = userService.getUserByToken(token);
        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token.");
        }

        Account account = accounts.findById(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        validateOwnership(account, authenticatedUser);

        return transactions.findByAccount_AccountNumber(accountNumber);
    }

    @Transactional(readOnly = true)
    public List<Transaction> filterTransactions(
            String token,
            TransactionType type,
            LocalDateTime fromDate,
            LocalDateTime toDate) {

        User authenticatedUser = userService.getUserByToken(token);
        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token.");
        }

        LocalDateTime start = (fromDate != null) ? fromDate : LocalDateTime.now().minusYears(100);
        LocalDateTime end = (toDate != null) ? toDate : LocalDateTime.now();

        Specification<Transaction> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("account").get("user").get("id"), authenticatedUser.getId()));

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("transactionType"), type));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        List<Transaction> baseTransactions = transactions.findAll(spec);

        return expandRecurringTransactions(baseTransactions, start, end);
    }

    private List<Transaction> expandRecurringTransactions(
            List<Transaction> baseTransactions,
            LocalDateTime start,
            LocalDateTime end) {

        List<Transaction> resultList = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Transaction baseTx : baseTransactions) {
            LocalDateTime txTime = baseTx.getTimestamp();

            if (!txTime.isBefore(start) && !txTime.isAfter(end)) {
                resultList.add(baseTx);
            }

            Long periodDays = baseTx.getRecurrencePeriod();
            if (periodDays != null && periodDays > 0) {
                LocalDateTime nextOccurrence = txTime;

                while (true) {
                    nextOccurrence = advanceOccurrence(nextOccurrence, periodDays);

                    if (nextOccurrence.isAfter(end)) {
                        break;
                    }

                    if (nextOccurrence.isAfter(now) && !nextOccurrence.isBefore(start)) {
                        Transaction projectedTx = new Transaction(
                                baseTx.getAccount(),
                                baseTx.getTransactionType(),
                                baseTx.getAmount(),
                                baseTx.getRecurrencePeriod(),
                                baseTx.getDescription() + " (Projected)",
                                nextOccurrence);
                        resultList.add(projectedTx);
                    }
                }
            }
        }

        resultList.sort((t1, t2) -> {
            if (t1.getTimestamp() == null)
                return 1;
            if (t2.getTimestamp() == null)
                return -1;
            return t1.getTimestamp().compareTo(t2.getTimestamp());
        });
        return resultList;
    }

    private LocalDateTime advanceOccurrence(LocalDateTime current, Long recurrencePeriodDays) {
        long days = (recurrencePeriodDays != null && recurrencePeriodDays > 0) ? recurrencePeriodDays : 30L;
        return current.plusDays(days);
    }

    private void validateOwnership(Account account, User user) {
        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this account.");
        }
    }

    @Transactional
    public void deleteTransaction(String token, Long id) {
        Transaction transaction = transactions.findById(id)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction " + id + " not found"));

        Double amount = transaction.getAmount();

        if (transaction.getAccount() != null && transaction.getTransactionType() != null) {
            Account account = transaction.getAccount();
            Long accountNumber = account.getAccountNumber();
            Double currentBalance = account.getBalance();
            Double updatedBalance = currentBalance;

            switch (transaction.getTransactionType()) {
                case ACCOUNT_DEPOSIT:
                    updatedBalance -= amount;
                    break;
                case ACCOUNT_WITHDRAWL:
                    break;
                default:
                    break;
            }

            accountService.updateAccountBalance(token, accountNumber, updatedBalance);
        }

        transactions.delete(transaction);
    }

    @Transactional
    public Transaction createTransaction(String token, TransactionRequest request) {
        User authenticatedUser = userService.getUserByToken(token);
        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Transaction request body cannot be null.");
        }

        if (request.amount() == null || request.amount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        Account targetAccount = null;
        TransactionType type = request.transactionType();

        switch (type) {
            case ACCOUNT_WITHDRAWL:
                if (request.account() == null || request.account().getAccountNumber() == null) {
                    throw new IllegalArgumentException("Account must be provided for withdrawals.");
                }
                targetAccount = accounts.findById(request.account().getAccountNumber())
                        .orElseThrow(() -> new IllegalArgumentException("Account not found."));

                validateOwnership(targetAccount, authenticatedUser);

                if (targetAccount.getBalance() < request.amount()) {
                    throw new IllegalStateException("Insufficient funds for withdrawal.");
                }

                accountService.updateAccountBalance(token, targetAccount.getAccountNumber(),
                        targetAccount.getBalance() - request.amount());
                break;

            case ACCOUNT_DEPOSIT:
                if (request.account() == null || request.account().getAccountNumber() == null) {
                    throw new IllegalArgumentException("Account must be provided for deposits.");
                }
                targetAccount = accounts.findById(request.account().getAccountNumber())
                        .orElseThrow(() -> new IllegalArgumentException("Account not found."));

                validateOwnership(targetAccount, authenticatedUser);

                accountService.updateAccountBalance(token, targetAccount.getAccountNumber(),
                        targetAccount.getBalance() + request.amount());
                break;

            case BUDGET_DEPOSIT:
                if (request.account() != null && request.account().getAccountNumber() != null) {
                    targetAccount = accounts.findById(request.account().getAccountNumber())
                            .orElseThrow(() -> new IllegalArgumentException("Account not found."));
                    validateOwnership(targetAccount, authenticatedUser);
                }
                break;

            case BUDGET_WITHDRAWL:
                List<Account> userAccounts = accountService.getAccountsByToken(token);
                targetAccount = userAccounts.stream()
                        .filter(acc -> "CHECKING".equalsIgnoreCase(acc.getAccountType().toString())
                                && acc.getBalance() >= request.amount())
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException(
                                "No checking account with sufficient funds found for budget withdrawal."));

                accountService.updateAccountBalance(token, targetAccount.getAccountNumber(),
                        targetAccount.getBalance() - request.amount());
                break;

            default:
                throw new IllegalArgumentException("Unsupported transaction type: " + type);
        }

        Transaction transaction = new Transaction(
                targetAccount,
                request.transactionType(),
                request.amount(),
                request.recurrencePeriod(),
                request.description(),
                (request.timestamp() != null) ? request.timestamp() : LocalDateTime.now());

        return transactions.save(transaction);
    }

    @Transactional
    public List<Transaction> accountTransfer(String token, AccountTransferRequest request) {
        User authenticatedUser = userService.getUserByToken(token);
        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Account transfer request cannot be null.");
        }

        if (request.amount() == null || request.amount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        if (request.sourceAccount() == null || request.targetAccount() == null) {
            throw new IllegalArgumentException("Source and target accounts must be provided.");
        }

        LocalDateTime timestamp = (request.timestamp() != null) ? request.timestamp() : LocalDateTime.now();
        String baseDesc = (request.description() != null && !request.description().isBlank())
                ? request.description()
                : "Transfer from Account #" + request.sourceAccount().getAccountNumber() + " to Account #"
                        + request.targetAccount().getAccountNumber();

        TransactionRequest withdrawRequest = new TransactionRequest(
                request.sourceAccount(),
                TransactionType.ACCOUNT_WITHDRAWL,
                request.amount(),
                0L,
                baseDesc + " (Withdrawal)",
                timestamp);
        Transaction sourceTx = createTransaction(token, withdrawRequest);

        TransactionRequest depositRequest = new TransactionRequest(
                request.targetAccount(),
                TransactionType.ACCOUNT_DEPOSIT,
                request.amount(),
                0L,
                baseDesc + " (Deposit)",
                timestamp);
        Transaction targetTx = createTransaction(token, depositRequest);

        List<Transaction> savedTransactions = new ArrayList<>();
        savedTransactions.add(sourceTx);
        savedTransactions.add(targetTx);

        return savedTransactions;
    }

    @Transactional
    public void budgetTransfer(String token, BudgetTransferRequest request) {
        User authenticatedUser = userService.getUserByToken(token);
        if (authenticatedUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Budget transfer request cannot be null.");
        }

        if (request.amount() == null || request.amount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        if (request.sourceAccount() == null || request.sourceAccount().getAccountNumber() == null ||
                request.targetBudget() == null || request.targetBudget().getId() == null) {
            throw new IllegalArgumentException("Source account and target budget must be provided.");
        }

        LocalDateTime timestamp = (request.timestamp() != null) ? request.timestamp() : LocalDateTime.now();
        String description = (request.description() != null && !request.description().isBlank())
                ? request.description()
                : "Transfer from Account #" + request.sourceAccount().getAccountNumber() + " to Budget #"
                        + request.targetBudget().getId();

        TransactionRequest withdrawRequest = new TransactionRequest(
                request.sourceAccount(),
                TransactionType.ACCOUNT_WITHDRAWL,
                request.amount(),
                0L,
                description + " (Withdrawal)",
                timestamp);

        createTransaction(token, withdrawRequest);

        Double currentAmount = request.targetBudget().getCurrentAmount();
        budgetService.updateBudgetCurrentAmount(token, request.targetBudget().getId(),
                currentAmount + request.amount());
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void processRecurringTransactions() {
        LocalDateTime now = LocalDateTime.now();

        List<Transaction> recurringTransactions = transactions.findByRecurrencePeriodGreaterThan(0L);

        for (Transaction baseTx : recurringTransactions) {
            LocalDateTime lastOccurrence = baseTx.getTimestamp();
            Long periodDays = baseTx.getRecurrencePeriod();

            if (periodDays == null || periodDays <= 0 || lastOccurrence == null) {
                continue;
            }

            long daysPassed = ChronoUnit.DAYS.between(lastOccurrence, now);

            if (daysPassed >= periodDays) {
                LocalDateTime newTimestamp = lastOccurrence.plusDays(periodDays);

                TransactionRequest request = new TransactionRequest(
                        baseTx.getAccount(),
                        baseTx.getTransactionType(),
                        baseTx.getAmount(),
                        baseTx.getRecurrencePeriod(),
                        baseTx.getDescription(),
                        newTimestamp);

                String userToken = baseTx.getAccount().getUser().getToken();
                createTransaction(userToken, request);

                baseTx.setTimestamp(newTimestamp);
                transactions.save(baseTx);
            }
        }
    }
}