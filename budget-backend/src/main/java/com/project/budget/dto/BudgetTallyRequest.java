package com.project.budget.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BudgetTallyRequest(
        @NotNull(message = "Start date is required")
        LocalDateTime startDate,

        @NotNull(message = "End date is required")
        LocalDateTime endDate
) {
    public BudgetTallyRequest {
    }
}