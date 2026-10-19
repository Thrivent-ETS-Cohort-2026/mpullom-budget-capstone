package com.project.budget.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AccountTransferRequest(
    @NotNull(message = "Source account number cannot be null.")
    Long sourceAccountNumber,

    @NotNull(message = "Target account number cannot be null.")
    Long targetAccountNumber,

    @NotNull(message = "Amount cannot be null.")
    @Positive(message = "Amount must be greater than zero.")
    Double amount,

    String description,
    
    LocalDateTime timestamp
) {}