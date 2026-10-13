package com.project.budget.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.budget.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findUserByEmail(String email);
}
