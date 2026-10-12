package com.example.banking_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.banking_backend.model.Transfer;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    
}

