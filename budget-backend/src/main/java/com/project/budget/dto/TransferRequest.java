package com.example.banking_backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record TransferRequest(
    @NotNull(message = "Sender account number is required")
    Long senderAccountNumber,

    @NotNull(message = "Receiver account number is required")
    Long receiverAccountNumber,

    @NotNull(message = "Transfer amount is required")
    @Positive(message = "Transfer amount must be greater than zero")
    Long amount,

    LocalDateTime timestamp
) {
    public TransferRequest {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}