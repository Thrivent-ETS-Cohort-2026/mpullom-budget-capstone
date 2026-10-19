package com.project.budget.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.project.budget.dto.AccountTransferRequest;
import com.project.budget.model.AccountTransfer;
import com.project.budget.service.AccountTransferService;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin(
    origins = "http://localhost:3000", 
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE},
    allowedHeaders = {"Authorization", "Content-Type"}
)
public class AccountTransferController {

    private final AccountTransferService transferService;

    public AccountTransferController(AccountTransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<AccountTransfer> createTransfer(
            @RequestBody AccountTransferRequest request,
            @RequestHeader("Authorization") String authHeader) {
                
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AccountTransfer transfer = transferService.createAccountTransfer(
                request.sourceAccountNumber(),
                request.targetAccountNumber(),
                request.amount(),
                request.description(),
                request.timestamp()
        );

        return new ResponseEntity<>(transfer, HttpStatus.CREATED);
    }
}