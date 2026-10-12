package com.example.banking_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.banking_backend.dto.TransferRequest;
import com.example.banking_backend.model.Transfer;
import com.example.banking_backend.service.TransferService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<Transfer> createAccount(@Valid @RequestBody TransferRequest newTransfer) {
        Transfer savedTransfer = transferService.transferFunds(newTransfer);
        return new ResponseEntity<>(savedTransfer, HttpStatus.CREATED);

    }
}
