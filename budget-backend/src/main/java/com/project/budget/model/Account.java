package com.project.budget.model;

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
@Table(name = "account_data")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_number")
    private Long accountNumber;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(name = "balance", nullable = false)
    private Double balance;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus;

    public Account() {
    }

    public Account(AccountType accountType, User user, Double initialBalance, AccountStatus accountStatus) {
        this.accountType = accountType;
        this.user = user;
        this.balance = initialBalance;
        this.accountStatus = accountStatus;
    }

    public Long getAccountNumber() {
        return accountNumber;
    }

    public User getUser() {
        return this.user;
    }

    public User setUser(User newUser) {
        return this.user = newUser;
    }

    public AccountType getAccountType() {
        return this.accountType;
    }

    public AccountType setAccountType(AccountType accountType) {
        return this.accountType = accountType;
    }

    public Double getBalance() {
        return this.balance;
    }

    public void setBalance(Double newBalance) {
        this.balance = newBalance;
    }

    public AccountStatus getAccountStatus() {
        return this.accountStatus;
    }

    public void setAccountStatus(AccountStatus newStatus) {
        this.accountStatus = newStatus;
    }
}
