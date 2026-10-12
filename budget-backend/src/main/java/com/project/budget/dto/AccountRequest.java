package com.example.banking_backend.dto;

import com.example.banking_backend.model.AccountStatus;
import com.example.banking_backend.model.AccountType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AccountRequest(
        @NotNull(message = "Account type is required") AccountType accountType,

        @NotNull(message = "Customer ID is required") Long customerId,

        @Min(value = 0, message = "Initial balance cannot be negative") double initialBalance,

        AccountStatus accountStatus) {

    public AccountRequest {
        if (accountStatus == null) {
            accountStatus = AccountStatus.ACTIVE;
        }
    }
}