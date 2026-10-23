package com.project.budget.dto;

import java.time.LocalDateTime;

import com.project.budget.model.Account;
import com.project.budget.model.Budget;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BudgetTransferRequest(
        @NotNull(message = "Source account cannot be null.") Account sourceAccount,

        @NotNull(message = "Target account cannot be null.") Budget targetBudget,

        @NotNull(message = "Amount cannot be null.") @Positive(message = "Amount must be greater than zero.") Double amount,

        String description,

        LocalDateTime timestamp) {
}