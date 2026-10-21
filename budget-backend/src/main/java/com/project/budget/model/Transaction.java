package com.project.budget.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "transaction_data")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne
    @JoinColumn(name = "account_number", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "time_stamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "recurrence_period", nullable = false)
    private Long recurrencePeriod;

    @Column(name = "description", nullable = false)
    private String description;

    public Transaction() {
    }

    public Transaction(Account account, Budget budget, TransactionType transactionType, Double amount,
            Long recurrencePeriod, String description, LocalDateTime timestamp) {
        if (account == null) {
            throw new IllegalArgumentException("Account cannot be null.");
        }
        if (budget == null) {
            throw new IllegalArgumentException("Budget cannot be null.");
        }
        if (amount == null || amount < 0) {
            throw new IllegalArgumentException("Amount must be non-null and positive. Provided: " + amount);
        }
        if (recurrencePeriod == null || recurrencePeriod < 0) {
            throw new IllegalArgumentException("Reccurence period must be non-null and positive. Provided: " + recurrencePeriod);
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Description cannot be null or empty.");
        }

        this.account = account;
        this.transactionType = transactionType;
        this.amount = amount;
        this.recurrencePeriod = recurrencePeriod;
        this.description = description;
        this.timestamp = (timestamp != null) ? timestamp : LocalDateTime.now();
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getRecurrencePeriod() {
        return recurrencePeriod;
    }

    public void setRecurrencePeriod(Long recurrencePeriod) {
        this.recurrencePeriod = recurrencePeriod;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}