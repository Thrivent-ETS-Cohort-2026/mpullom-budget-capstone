package com.project.budget.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.budget.model.TransactionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record TransactionRequest(
    @NotNull(message = "Account number is required")
    Long accountNumber,

    @NotNull(message = "Transaction type is required")
    TransactionType transactionType,

    @Positive(message = "Amount must be greater than zero")
    double amount,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime timestamp
) {
    public TransactionRequest {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}