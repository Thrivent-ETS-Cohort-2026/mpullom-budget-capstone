package com.project.budget.service;

import com.project.budget.dto.BudgetRequest;
import com.project.budget.dto.BudgetTallyResponse;
import com.project.budget.model.Budget;
import com.project.budget.model.Category;
import com.project.budget.model.Transaction;
import com.project.budget.model.TransactionType;
import com.project.budget.model.User;
import com.project.budget.repository.BudgetRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

        List<Budget> userBudgets = budgets.findByUser(user);
        
        List<Category> enabledCategories = userBudgets.stream()
                .filter(b -> b.getEnabled() != null && b.getEnabled())
                .map(Budget::getCategory)
                .filter(c -> c != null)
                .distinct()
                .collect(Collectors.toList());

        List<Transaction> filteredTransactions = transactionService.filterTransactions(token, TransactionType.ACCOUNT_WITHDRAWAL, startDate, endDate);

        double currentTally = 0.0;
        for (Transaction tx : filteredTransactions) {
            if (tx.getAmount() != null) {
                String desc = tx.getDescription();
                boolean isTransfer = desc != null && desc.toLowerCase().contains("transfer");
                boolean matchesEnabledCategory = tx.getCategory() != null && enabledCategories.contains(tx.getCategory());

                if (!isTransfer && matchesEnabledCategory) {
                    currentTally += tx.getAmount();
                }
            }
        }

        double maxTally = 0.0;
        for (Budget budget : userBudgets) {
            if (!budget.getEnabled()) {
                continue;
            }

            if (budget.getMaxAmount() != null) {
                double adjustedMax = calculatePeriodAdjustedMax(budget, startDate, endDate);
                maxTally += adjustedMax;
            }
        }

        return new BudgetTallyResponse(currentTally, maxTally);
    }

    @Transactional(readOnly = true)
    public BudgetTallyResponse tallyBudgetCategoryTransactions(String token, Long budgetId, LocalDateTime startDate, LocalDateTime endDate) {
        User user = userService.getUserByToken(token);
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Budget budget = budgets.findById(budgetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget " + budgetId + " not found"));

        if (budget.getUser().getToken() == null || !budget.getUser().getToken().equals(token)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current user is not authorized to access this budget");
        }

        if (!budget.getEnabled()) {
            return new BudgetTallyResponse(0.0, 0.0);
        }

        Category budgetCategory = budget.getCategory();

        List<Transaction> allFilteredTransactions = transactionService.filterTransactions(token, TransactionType.ACCOUNT_WITHDRAWAL, startDate, endDate);
        
        List<Transaction> categoryTransactions = allFilteredTransactions.stream()
                .filter(tx -> tx.getCategory() != null && tx.getCategory().equals(budgetCategory))
                .filter(tx -> tx.getDescription() == null || !tx.getDescription().toLowerCase().contains("transfer"))
                .collect(Collectors.toList());

        double currentTally = 0.0;
        for (Transaction tx : categoryTransactions) {
            if (tx.getAmount() != null) {
                currentTally += tx.getAmount();
            }
        }

        double maxTally = budget.getMaxAmount() != null ? calculatePeriodAdjustedMax(budget, startDate, endDate) : 0.0;

        return new BudgetTallyResponse(currentTally, maxTally);
    }

    private double calculatePeriodAdjustedMax(Budget budget, LocalDateTime startDate, LocalDateTime endDate) {
        if (budget.getMaxAmount() == null) {
            return 0.0;
        }

        return budget.getMaxAmount();
    }
}