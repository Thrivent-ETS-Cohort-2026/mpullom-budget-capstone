package com.example.banking_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.banking_backend.dto.TransactionRequest;
import com.example.banking_backend.model.Account;
import com.example.banking_backend.model.Transaction;
import com.example.banking_backend.model.TransactionType;
import com.example.banking_backend.repository.AccountRepository;
import com.example.banking_backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactions;
    private final AccountRepository accounts;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactions = transactionRepository;
        this.accounts = accountRepository;
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        if (request == null || request.accountNumber() == null) {
            throw new IllegalArgumentException("Account number must be provided.");
        }

        Account account = accounts.findById(request.accountNumber())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Account not found with number: " + request.accountNumber()));

        if (request.amount() <= 0) {
            throw new IllegalArgumentException("Transaction amount must be greater than zero.");
        }

        if (request.transactionType() == TransactionType.WITHDRAWL) {
            if (account.getBalance() < request.amount()) {
                throw new IllegalStateException("Insufficient funds for withdrawal.");
            }
            account.setBalance(account.getBalance() - request.amount());
        } else if (request.transactionType() == TransactionType.DEPOSIT) {
            account.setBalance(account.getBalance() + request.amount());
        } else {
            throw new IllegalArgumentException("Unsupported transaction type: " + request.transactionType());
        }

        accounts.save(account);

        Transaction transaction = new Transaction(
                account.getAccountNumber(),
                request.transactionType(),
                request.amount(),
                (request.timestamp() != null) ? request.timestamp() : LocalDateTime.now());

        return transactions.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByAccountNum(Long accountNumber) {
        if (accountNumber == null) {
            throw new IllegalArgumentException("Account number cannot be null.");
        }
        return transactions.findByAccountNumber(accountNumber);
    }

    public List<Transaction> filterTransactions(
            Long accountNo,
            TransactionType type,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Double minAmount,
            Double maxAmount) {
        Specification<Transaction> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (accountNo != null) {
                predicates.add(criteriaBuilder.equal(root.get("accountNumber"), accountNo));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("transactionType"), type));
            }

            if (fromDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), fromDate));
            }

            if (toDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), toDate));
            }

            if (minAmount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }

            if (maxAmount != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        return transactions.findAll(spec);
    }
}