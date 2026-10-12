package com.project.budget.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.banking_backend.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
}
