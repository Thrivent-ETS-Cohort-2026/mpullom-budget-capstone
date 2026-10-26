package com.project.budget.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.project.budget.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByAccount_AccountNumber(Long accountNumber);
    List<Transaction> findByRecurrencePeriodGreaterThan(Long period);
}