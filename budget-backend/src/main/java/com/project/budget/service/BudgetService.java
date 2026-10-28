package com.project.budget.service;

import com.project.budget.dto.BudgetRequest;
import com.project.budget.dto.BudgetTallyResponse;
import com.project.budget.model.Budget;
import com.project.budget.model.Transaction;
import com.project.budget.model.User;
import com.project.budget.repository.BudgetRepository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BudgetService {
    private final BudgetRepository budgets;
    private final UserService userService;
    private final TransactionService transactionService;

    public BudgetService(BudgetRepository budgets, UserService userService, @Lazy TransactionService transactionService) {
        this.budgets = budgets;
        this.userService = userService;
        this.transactionService = transactionService;
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
                request.enabled(),
                request.startDate(),
            request.category());
        return budgets.save(budget);
    }

    @Transactional
    public Budget updateMaxBudgetAmount(String token, Long budgetId, Double newAmount) {
        Budget budget = budgets.findById(budgetId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget " + budgetId + " not found"));

        if (budget.getUser().getToken() == null || !budget.getUser().getToken().equals(token)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Current user is not authorized to make this call");
        }

        if (newAmount != null) {
            budget.setMaxAmount(newAmount);
        }

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

        if (budgetUpdates.maxAmount() != null) {
            budget.setMaxAmount(budgetUpdates.maxAmount());
        }

        if (budgetUpdates.targetPeriod() != null) {
            budget.setTargetPeriod(budgetUpdates.targetPeriod());
        }

        if (budgetUpdates.enabled() != null) {
            budget.setEnabled(budgetUpdates.enabled());
        }

        if (budgetUpdates.startDate() != null) {
            budget.setStartDate(budgetUpdates.startDate());
        }

        return budgets.save(budget);
    }

    @Transactional
    public void deleteBudget(String token, Long budgetId) {
        Budget budget = budgets.findById(budgetId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget " + budgetId + " not found"));

        budgets.delete(budget);
    }

@Transactional(readOnly = true)
    public BudgetTallyResponse tallyFilteredTransactionsAmount(String token, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userService.getUserByToken(token);
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        List<Transaction> filteredTransactions = transactionService.filterTransactions(token, null, startDate, endDate);

        double currentTally = 0.0;
        for (Transaction tx : filteredTransactions) {
            if (tx.getAmount() != null) {
                currentTally += tx.getAmount();
            }
        }

        List<Budget> userBudgets = budgets.findByUser(user);
        double maxTally = 0.0;
        for (Budget budget : userBudgets) {
            if (budget.getMaxAmount() != null) {
                maxTally += budget.getMaxAmount();
            }
        }

        return new BudgetTallyResponse(currentTally, maxTally);
    }
}