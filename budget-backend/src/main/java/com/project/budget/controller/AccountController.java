package com.project.budget.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.project.budget.service.AccountService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE }, allowedHeaders = { "Authorization", "Content-Type" })
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody AccountRequest newAccount) {
        Account savedAccount = accountService.createAccount(newAccount);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    @PutMapping("/{acctNo}/balance")
    public ResponseEntity<Account> updateAccountBalance(
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

    @GetMapping
    public ResponseEntity<List<Account>> getAccountsByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        return ResponseEntity.ok(accountService.getAccountsByToken(token));
    }

    @PutMapping("/{acctNo}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable Long acctNo,
            @Valid @RequestBody AccountRequest updatedAccountRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        Account savedAccount = accountService.updateAccount(token, acctNo, updatedAccountRequest);
        return ResponseEntity.ok(savedAccount);
    }
}