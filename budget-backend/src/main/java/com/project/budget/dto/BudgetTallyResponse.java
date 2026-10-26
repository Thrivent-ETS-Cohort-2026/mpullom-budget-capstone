package com.project.budget.dto;

public record BudgetTallyResponse(
    Double currentAmountTally,
    Double maxAmountTally
) {}