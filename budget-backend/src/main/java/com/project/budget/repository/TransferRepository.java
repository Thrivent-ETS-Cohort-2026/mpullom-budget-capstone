package com.project.budget.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.banking_backend.model.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    
}

