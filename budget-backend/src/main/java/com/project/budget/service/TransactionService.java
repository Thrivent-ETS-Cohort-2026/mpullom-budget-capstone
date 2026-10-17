package com.project.budget.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.budget.dto.BudgetRequest;
import com.project.budget.dto.TransactionRequest;
import com.project.budget.model.Account;
import com.project.budget.model.Budget;
import com.project.budget.model.TargetPeriod;
import com.project.budget.model.Transaction;
import com.project.budget.model.TransactionType;
import com.project.budget.model.User;
import com.project.budget.repository.AccountRepository;
import com.project.budget.repository.BudgetRepository;
import com.project.budget.repository.TransactionRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final AccountRepository accounts;
    private final BudgetRepository budgets;
    private final UserService userService;
    private final AccountService accountService;
    private final BudgetService budgetService;

    public TransactionService(
            TransactionRepository transactions,
            AccountRepository accounts,
            BudgetRepository budgets,
            UserService userService,
            AccountService accountService,
            BudgetService budgetService) {
        this.transactions = transactions;
        this.accounts = accounts;
        this.budgets = budgets;
        this.userService = userService;
        this.accountService = accountService;
        this.budgetService = budgetService;
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

        if (request.budget() == null || request.budget().getId() == null) {
            throw new IllegalArgumentException("A budget must be specified for all transactions.");
        }

        Budget targetBudget = budgets.findById(request.budget().getId())
                .orElseThrow(
                        () -> new IllegalArgumentException("Budget not found with ID: " + request.budget().getId()));

        validateBudgetOwnership(targetBudget, authenticatedUser);

        Account targetAccount = null;
        TransactionType type = request.transactionType();

        switch (type) {
            case ACCOUNT_WITHDRAWL:
                if (request.account() == null || request.account().getAccountNumber() == null) {
                    throw new IllegalArgumentException("Account must be provided for account withdrawals.");
                }
                targetAccount = accounts.findById(request.account().getAccountNumber())
                        .orElseThrow(() -> new IllegalArgumentException("Account not found."));

                validateOwnership(targetAccount, authenticatedUser);

                if (targetAccount.getBalance() < request.amount()) {
                    throw new IllegalStateException("Insufficient funds for withdrawal.");
                }

                accountService.updateAccountBalance(token, targetAccount.getAccountNumber(),
                        targetAccount.getBalance() - request.amount());

                double updatedBudgetSpent = (targetBudget.getCurrentAmount() != null ? targetBudget.getCurrentAmount()
                        : 0.0) + request.amount();
                targetBudget.setCurrentAmount(updatedBudgetSpent);
                budgetService.updateBudgetAmount(token, targetBudget.getId(), updatedBudgetSpent);
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

            case BUDGET_TRANSFER:
                if (request.account() == null || request.account().getAccountNumber() == null) {
                    throw new IllegalArgumentException("Account must be provided for budget transfers.");
                }
                targetAccount = accounts.findById(request.account().getAccountNumber())
                        .orElseThrow(() -> new IllegalArgumentException("Account not found."));

                validateOwnership(targetAccount, authenticatedUser);

                if (targetAccount.getBalance() < request.amount()) {
                    throw new IllegalStateException("Insufficient funds in account for budget transfer.");
                }

                accountService.updateAccountBalance(token, targetAccount.getAccountNumber(),
                        targetAccount.getBalance() - request.amount());

                double newBudgetAmount = (targetBudget.getCurrentAmount() != null ? targetBudget.getCurrentAmount()
                        : 0.0) + request.amount();
                targetBudget.setCurrentAmount(newBudgetAmount);
                budgetService.updateBudgetAmount(token, targetBudget.getId(), newBudgetAmount);
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

                double reducedBudgetAmt = Math.max(0.0,
                        (targetBudget.getCurrentAmount() != null ? targetBudget.getCurrentAmount() : 0.0)
                                - request.amount());
                targetBudget.setCurrentAmount(reducedBudgetAmt);
                budgetService.updateBudgetAmount(token, targetBudget.getId(), reducedBudgetAmt);
                break;

            default:
                throw new IllegalArgumentException("Unsupported transaction type: " + type);
        }

        Transaction transaction = new Transaction(
                targetAccount,
                targetBudget,
                type,
                request.amount(),
                request.recurrence(),
                request.description(),
                (request.timestamp() != null) ? request.timestamp() : LocalDateTime.now());

        return transactions.save(transaction);
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
        LocalDateTime now = LocalDateTime.now();

        Specification<Transaction> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("account").get("user").get("id"), authenticatedUser.getId()));
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), start));
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), end));

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("transactionType"), type));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        List<Transaction> resultList = new ArrayList<>(transactions.findAll(spec));

        if (end.isAfter(now)) {
            Specification<Transaction> recurringSpec = (root, query, criteriaBuilder) -> {
                List<Predicate> recurringPredicates = new ArrayList<>();
                recurringPredicates.add(
                        criteriaBuilder.equal(root.get("account").get("user").get("id"), authenticatedUser.getId()));
                recurringPredicates.add(criteriaBuilder.equal(root.get("recurrence"), true));
                recurringPredicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), now));

                if (type != null) {
                    recurringPredicates.add(criteriaBuilder.equal(root.get("transactionType"), type));
                }

                return criteriaBuilder.and(recurringPredicates.toArray(new Predicate[0]));
            };

            List<Transaction> baseRecurring = transactions.findAll(recurringSpec);

            for (Transaction baseTx : baseRecurring) {
                LocalDateTime nextOccurrence = baseTx.getTimestamp();

                while (true) {
                    nextOccurrence = advanceOccurrence(nextOccurrence, baseTx.getBudget());

                    if (nextOccurrence.isAfter(end)) {
                        break;
                    }

                    if (nextOccurrence.isAfter(now) && !nextOccurrence.isBefore(start)) {
                        Transaction projectedTx = new Transaction(
                                baseTx.getAccount(),
                                baseTx.getBudget(),
                                baseTx.getTransactionType(),
                                baseTx.getAmount(),
                                true,
                                baseTx.getDescription() + " (Projected)",
                                nextOccurrence);
                        resultList.add(projectedTx);
                    }
                }
            }
        }

        resultList.sort((t1, t2) -> t1.getTimestamp().compareTo(t2.getTimestamp()));
        return resultList;
    }

    private LocalDateTime advanceOccurrence(LocalDateTime current, Budget budget) {
        if (budget != null && budget.getTargetPeriod() != null) {
            TargetPeriod period = budget.getTargetPeriod();
            switch (period) {
                case MONTHLY:
                    return current.plusWeeks(1);
                case QUARTERLY:
                    return current.plusMonths(1);
                case YEARLY:
                    return current.plusYears(1);
                default:
                    return current.plusMonths(1);
            }
        }
        return current.plusMonths(1);
    }

    private void validateOwnership(Account account, User user) {
        if (!account.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this account.");
        }
    }

    private void validateBudgetOwnership(Budget budget, User user) {
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this budget.");
        }
    }

   @Transactional
    public void deleteTransaction(String token, Long id) {
        Transaction transaction = transactions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction " + id + " not found"));

        double amount = transaction.getAmount();

        if (transaction.getAccount() != null && transaction.getTransactionType() != null) {
            Account account = transaction.getAccount();
            Long accountNumber = account.getAccountNumber(); 
            double updatedBalance = account.getBalance();
            switch (transaction.getTransactionType()) {
                case ACCOUNT_DEPOSIT:
                    updatedBalance -= amount;
                    break;
                case ACCOUNT_WITHDRAWL:
                    updatedBalance += amount;
                    break;
                default:
                    break;
            }

            accountService.updateAccountBalance(token, accountNumber, updatedBalance);
        }

        if (transaction.getBudget() != null && transaction.getBudget().getId() != 0 && transaction.getTransactionType() != null) {
            Long budgetId = transaction.getBudget().getId();
            Budget budget = transaction.getBudget();

            double updatedAmount = budget.getCurrentAmount();
            switch (transaction.getTransactionType()) {
                case BUDGET_TRANSFER:
                    updatedAmount -= amount;
                    break;
                case BUDGET_WITHDRAWL:
                    updatedAmount += amount;
                    break;
                default:
                    break;
            }

            budgetService.updateBudgetByID(token, budgetId, new BudgetRequest(
                    budget.getUser(),
                    budget.getDescription(),
                    budget.getTargetPeriod(),
                    updatedAmount,
                    budget.getMaxAmount(),
                    budget.getEnabled()
            ));
        }

        transactions.delete(transaction);
    }
}