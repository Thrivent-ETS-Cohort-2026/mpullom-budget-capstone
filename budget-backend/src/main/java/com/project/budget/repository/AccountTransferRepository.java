package com.project.budget.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.budget.model.AccountTransfer;

public interface AccountTransferRepository extends JpaRepository<AccountTransfer, Long>{
    
}
