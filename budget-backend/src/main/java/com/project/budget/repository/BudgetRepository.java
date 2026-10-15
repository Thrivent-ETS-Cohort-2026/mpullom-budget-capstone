package com.project.budget.repository;

import com.project.budget.model.Budget;
import com.project.budget.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
}
