package com.project.budget.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.budget.model.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser_Id(Long userId);
}
