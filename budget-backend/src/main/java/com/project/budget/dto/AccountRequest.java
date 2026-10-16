package com.project.budget.dto;

import com.project.budget.model.AccountStatus;
import com.project.budget.model.AccountType;
import com.project.budget.model.User;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AccountRequest(
        @NotNull(message = "Account type is required") AccountType accountType,

        @NotNull(message = "User ID is required") User user,

        @Min(value = 0, message = "Initial balance cannot be negative") double initialBalance,

        AccountStatus accountStatus) {

    public AccountRequest {
        if (accountStatus == null) {
            accountStatus = AccountStatus.ACTIVE;
        }
    }
}