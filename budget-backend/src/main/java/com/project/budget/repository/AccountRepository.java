package com.project.budget.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.budget.model.Account;


public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
}
