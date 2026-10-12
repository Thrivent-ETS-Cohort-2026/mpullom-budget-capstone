package com.example.banking_backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.banking_backend.dto.TransferRequest;
import com.example.banking_backend.model.Transfer;
import com.example.banking_backend.repository.TransferRepository;

@Service
public class TransferService {

    private final TransferRepository transfers;
    private final AccountService accountService;

    public TransferService(TransferRepository transfers, AccountService accountService) {
        this.transfers = transfers;
        this.accountService = accountService;
    }

    @Transactional
    public Transfer transferFunds(TransferRequest newTransfer) {
        if (newTransfer.senderAccountNumber() == null || newTransfer.receiverAccountNumber() == null) {
            throw new IllegalArgumentException("Sender and receiver account numbers must be provided.");
        }

        if (newTransfer.senderAccountNumber().equals(newTransfer.receiverAccountNumber())) {
            throw new IllegalArgumentException("Sender and receiver account numbers cannot be the same.");
        }

        if (newTransfer.amount() == null || newTransfer.amount() <= 0) {
            throw new IllegalArgumentException("Transfer amount must be greater than zero.");
        }

        accountService.modifyBalance(newTransfer.senderAccountNumber(), -newTransfer.amount());
        accountService.modifyBalance(newTransfer.receiverAccountNumber(), newTransfer.amount());

        LocalDateTime timestamp = (newTransfer.timestamp() != null) ? newTransfer.timestamp() : LocalDateTime.now();

        Transfer transfer = new Transfer(
                newTransfer.senderAccountNumber(),
                newTransfer.receiverAccountNumber(),
                newTransfer.amount(),
                timestamp
        );

        return transfers.save(transfer);
    }
}