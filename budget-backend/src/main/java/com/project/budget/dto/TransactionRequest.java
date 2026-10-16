package com.project.budget.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.project.budget.model.Account;
import com.project.budget.model.Budget;
import com.project.budget.model.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record TransactionRequest(

    @NotNull(message = "Account is required")
    Account account,

    @NotNull(message = "Budget is required")
    Budget budget,

    @NotNull(message = "Transaction type is required")
    TransactionType transactionType,

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    Double amount,

    @NotNull(message = "Recurrence indicator is required")
    Boolean recurrence,

    @NotBlank(message = "Description cannot be empty")
    String description,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime timestamp

) {
    public TransactionRequest {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}