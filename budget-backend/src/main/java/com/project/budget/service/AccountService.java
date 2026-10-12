package com.example.banking_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;

import com.example.banking_backend.dto.AccountRequest;
import com.example.banking_backend.model.Account;
import com.example.banking_backend.model.AccountStatus;
import com.example.banking_backend.repository.AccountRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class AccountService {

    private final AccountRepository accounts;

    public AccountService(AccountRepository accounts) {
        this.accounts = accounts;
    }

    @Transactional
    public Account createAccount(AccountRequest newAccount) {
        Account account = new Account(
                newAccount.accountType(),
                newAccount.customerId(),
                newAccount.initialBalance(),
                newAccount.accountStatus());

        accounts.save(account);

        return account;
    }

    @Transactional(readOnly = true)
    public Account getAccountByNum(Long accountNumber) {
        return accounts.findById(accountNumber)
                .orElseThrow(() -> new IllegalArgumentException("Account " + accountNumber + " not found"));
    }

    @Transactional
    public Account updateAccountStatus(Long accountNumber, AccountStatus newStatus) {
        Account account = getAccountByNum(accountNumber);
        account.setAccountStatus(newStatus);
        return accounts.save(account);
    }

    @Transactional
    public void deleteAccount(Long accountNumber) {
        Account account = validateAccount(accountNumber);;

        if (account.getBalance() != 0) {
            throw new IllegalStateException("Cannot delete account. The balance must be zero.");
        }

        accounts.delete(account);
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByCustomerId(Long customerId) {
        return accounts.findByCustomerId(customerId);
    }

    @Transactional
    public Account modifyBalance(Long accountNumber, Long change) {
        Account account = getAccountByNum(accountNumber);

        double newBalance = account.getBalance() + change;
        if (newBalance < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }

        account.setBalance(newBalance);
        return accounts.save(account);
    }

    public Account validateAccount(Long accountNumber) {
        Account account = accounts.findById(accountNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        Long currentUserId = getCurrentUserIdFromRequest();

        if (!account.getCustomerId().equals(currentUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Current user is not authorized to make this call");
        }

        return account;
    }

    private Long getCurrentUserIdFromRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No active request context found");
        }

        HttpServletRequest request = attributes.getRequest();

        String currentId= request.getParameter("userId");

        if (currentId == null || currentId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing user information");
        }

        return Long.parseLong(currentId);
    }

    @Transactional(readOnly = true)
    public List<Account> getAllAccounts() {
        return accounts.findAll();
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return accounts.findByCustomerId(userId);
    }
}