package com.project.budget.service;

import com.project.budget.dto.BudgetRequest;
import com.project.budget.model.Budget;
import com.project.budget.model.User;
import com.project.budget.repository.BudgetRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {
    private final BudgetRepository budgets;
    private final UserService userService;

    public BudgetService(BudgetRepository budgets, UserService userService) {
        this.budgets = budgets;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Budget> getBudgetsByToken(String token) {
        User user = userService.getUserByToken(token);

        if (user == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return budgets.findByUser(user);
    }

    @Transactional
    public Budget createBudget(String token, BudgetRequest request) {
        if (request.user().getToken() == null || !request.user().getToken().equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Current user is not authorized to make this call");
        }

        Budget budget = new Budget(
                request.user(),
                request.description(),
                request.targetPeriod(),
                request.currentAmount(),
                request.maxAmount(),
                request.enabled());
        return budgets.save(budget);
    }

    @Transactional
    public Budget updateBudgetByID(String token, Long budgetId, BudgetRequest budgetUpdates) {
        Budget budget = budgets.findById(budgetId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget " + budgetId + " not found"));

        if (budget.getUser().getToken() == null || !budget.getUser().getToken().equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Current user is not authorized to make this call");
        }

        if (budgetUpdates.user() != null) {
            budget.setUser(budgetUpdates.user());
        }

        if (budgetUpdates.description() != null && !budgetUpdates.description().isBlank()) {
            budget.setDescription(budgetUpdates.description());
        }

        if (budgetUpdates.currentAmount() != null) {
            budget.setCurrentAmount(budgetUpdates.currentAmount());
        }

        if (budgetUpdates.maxAmount() != null) {
            budget.setMaxAmount(budgetUpdates.maxAmount());
        }

        if (budgetUpdates.targetPeriod() != null) {
            budget.setTargetPeriod(budgetUpdates.targetPeriod());
        }

        if (budgetUpdates.enabled() != null) {
            budget.setEnabled(budgetUpdates.enabled());
        }

        return budgets.save(budget);
    }
}