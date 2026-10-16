package com.project.budget.controller;

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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.budget.dto.AccountRequest;
import com.project.budget.model.Account;
import com.project.budget.model.Transaction;
import com.project.budget.service.AccountService;
import com.project.budget.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(
    origins = "http://localhost:3000", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowedHeaders = {"Authorization", "Content-Type"}
)
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

    @PutMapping("/{acctNo}/balance")
    public ResponseEntity<Account> updateAccountStatus(
            @PathVariable Long acctNo,
            @RequestParam Double newBalance,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        }

        String token = authHeader.substring(7);
        Account savedAccount = accountService.updateAccountBalance(token, acctNo, newBalance);
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
    public ResponseEntity<List<Account>> getAccountsByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        }
        String token = authHeader.substring(7);

        return ResponseEntity.ok(accountService.getAccountsByToken(token));
    }
}