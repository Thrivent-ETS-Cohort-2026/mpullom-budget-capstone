package com.project.budget.dto;

import com.project.budget.model.TargetPeriod;
import com.project.budget.model.User;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BudgetRequest(
        @NotNull(message = "User is required") User user,

        @NotBlank(message = "Description cannot be blank") String description,

        @NotNull(message = "Target period is required") TargetPeriod targetPeriod,

        Double currentAmount,

        Double maxAmount,

        @NotNull(message = "Enabled status is required") Boolean enabled) {

    public BudgetRequest {
    }
}