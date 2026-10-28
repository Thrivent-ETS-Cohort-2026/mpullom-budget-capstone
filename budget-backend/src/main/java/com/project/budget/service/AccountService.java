package com.project.budget.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.budget.dto.AccountRequest;
import com.project.budget.model.Account;
import com.project.budget.model.User;
import com.project.budget.repository.AccountRepository;

@Service
public class AccountService {

    private final AccountRepository accounts;
    private final UserService userService;

    public AccountService(AccountRepository accounts, UserService userService) {
        this.accounts = accounts;
        this.userService = userService;
    }

    @Transactional
    public Account createAccount(AccountRequest newAccount) {
        Account account = new Account(
                newAccount.accountType(),
                newAccount.user(),
                newAccount.balance(),
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
    public Account updateAccountBalance(String token, Long accountNumber, Double newBalance) {
        Account account = accounts.findById(accountNumber)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Account " + accountNumber + " not found"));

        if (account.getUser().getToken() == null || !account.getUser().getToken().equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Current user is not authorized to make this call");
        }

        account.setBalance(newBalance);
        return accounts.save(account);
    }

    @Transactional(readOnly = true)
    public List<Account> getAccountsByToken(String token) {
        User user = userService.getUserByToken(token);
        if (user == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return accounts.findByUser_Id(user.getId());
    }

    @Transactional
    public Account updateAccount(String token, Long acctNo, AccountRequest request) {
        User authUser = userService.getUserByToken(token);
        if (authUser == null) {
            throw new RuntimeException("Unauthorized: Invalid or expired token");
        }

        Account existingAccount = accounts.findById(acctNo)
                .orElseThrow(() -> new RuntimeException("Account not found with number: " + acctNo));

        if (existingAccount.getUser() == null || !existingAccount.getUser().getId().equals(authUser.getId())) {
            throw new RuntimeException("Forbidden: You do not have permission to modify this account");
        }

        if (request.accountType() != null) {
            existingAccount.setAccountType(request.accountType());
        }

        if (request.user() != null) {
            existingAccount.setUser(request.user());
        }

        if (request.balance() != null) {
            existingAccount.setBalance(request.balance());
        }

        if (request.accountStatus() != null) {
            existingAccount.setAccountStatus(request.accountStatus());
        }

        return accounts.save(existingAccount);
    }
}