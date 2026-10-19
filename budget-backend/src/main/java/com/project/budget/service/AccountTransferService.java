package com.project.budget.service;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.budget.model.Account;
import com.project.budget.model.AccountTransfer;
import com.project.budget.repository.AccountRepository;
import com.project.budget.repository.AccountTransferRepository;

@Service
public class AccountTransferService {

    private final AccountTransferRepository accountTransfers;
    private final AccountRepository accountRepository;

    public AccountTransferService(AccountTransferRepository accountTransfers, AccountRepository accountRepository) {
        this.accountTransfers = accountTransfers;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public AccountTransfer createAccountTransfer(Long sourceAccountNumber, Long targetAccountNumber, Double amount, String description, LocalDateTime timestamp) {
        if (sourceAccountNumber.equals(targetAccountNumber)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot transfer funds to the same account.");
        }

        if (amount == null || amount <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transfer amount must be greater than zero.");
        }

        Account sourceAccount = accountRepository.findById(sourceAccountNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Source account not found."));

        Account targetAccount = accountRepository.findById(targetAccountNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target account not found."));

        if (sourceAccount.getBalance() < amount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient funds for account transfer.");
        }

        sourceAccount.setBalance(sourceAccount.getBalance() - amount);
        targetAccount.setBalance(targetAccount.getBalance() + amount);

        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        String finalDescription = (description != null && !description.isBlank()) 
                ? description 
                : "Transfer from Account #" + sourceAccountNumber + " to Account #" + targetAccountNumber;

        AccountTransfer transfer = new AccountTransfer(
                sourceAccount,
                targetAccount,
                amount,
                finalDescription,
                timestamp != null ? timestamp : LocalDateTime.now()
        );

        return accountTransfers.save(transfer);
    }
}