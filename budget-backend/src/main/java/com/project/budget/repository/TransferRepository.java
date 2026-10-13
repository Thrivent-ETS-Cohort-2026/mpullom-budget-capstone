package com.project.budget.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.budget.model.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    
}

