package com.project.budget.controller;

import com.project.budget.dto.BudgetRequest;
import com.project.budget.dto.BudgetTallyRequest;
import com.project.budget.dto.BudgetTallyResponse;
import com.project.budget.model.Budget;
import com.project.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE }, allowedHeaders = { "Authorization", "Content-Type" })
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        Budget createdBudget = budgetService.createBudget(token, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
    }

    @GetMapping
    public ResponseEntity<List<Budget>> getBudgetsByToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        List<Budget> userBudgets = budgetService.getBudgetsByToken(token);
        return ResponseEntity.ok(userBudgets);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest budgetUpdates,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        Budget updatedBudget = budgetService.updateBudgetByID(token, id, budgetUpdates);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        budgetService.deleteBudget(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tally")
    public ResponseEntity<BudgetTallyResponse> tallyBudgetAmounts(
            @Valid @RequestBody BudgetTallyRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        BudgetTallyResponse response = budgetService.tallyFilteredTransactionsAmount(
                token, 
                request.startDate(), 
                request.endDate()
        );
        return ResponseEntity.ok(response);
    }
}