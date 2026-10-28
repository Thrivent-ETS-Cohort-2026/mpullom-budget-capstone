package com.project.budget.dto;

import java.time.LocalDateTime;

import com.project.budget.model.Account;
import com.project.budget.model.Category;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AccountTransferRequest(
                @NotNull(message = "Source account cannot be null.") Account sourceAccount,

                @NotNull(message = "Target account cannot be null.") Account targetAccount,

                @NotNull(message = "Amount cannot be null.") @Positive(message = "Amount must be greater than zero.") Double amount,

                String description,

                LocalDateTime timestamp,
                Category category) {
}