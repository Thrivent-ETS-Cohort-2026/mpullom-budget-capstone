package com.example.banking_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.banking_backend.dto.AccountRequest;
import com.example.banking_backend.model.Account;
import com.example.banking_backend.model.AccountStatus;
import com.example.banking_backend.model.Transaction;
import com.example.banking_backend.service.AccountService;
import com.example.banking_backend.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public AccountController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody AccountRequest newAccount) {
        Account savedAccount = accountService.createAccount(newAccount);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    @GetMapping("/{acctNo}")
    public ResponseEntity<Account> getAccountByNum(@PathVariable Long acctNo) {
        return ResponseEntity.ok(accountService.getAccountByNum(acctNo));
    }

    @PutMapping("/{acctNo}/status")
    public ResponseEntity<Account> updateAccountStatus(
            @PathVariable Long acctNo,
            @RequestParam AccountStatus newStatus) {
        Account savedAccount = accountService.updateAccountStatus(acctNo, newStatus);
        return ResponseEntity.ok(savedAccount);
    }

    @DeleteMapping("/{acctNo}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long acctNo,
            @RequestParam Long userId) {
        accountService.deleteAccount(acctNo);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{acctNo}/transactions")
    public ResponseEntity<List<Transaction>> recordTransaction(@PathVariable Long acctNo) {
        List<Transaction> transactions = transactionService.getTransactionsByAccountNum(acctNo);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(accountService.getAccountsByUserId(userId));
        }
        return ResponseEntity.ok(accountService.getAllAccounts());
    }
}