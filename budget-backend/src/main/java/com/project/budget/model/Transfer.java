package com.example.banking_backend.model;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.Valid;

@Entity 
public class Transfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transferId;

    @Column(name = "sender")
    private Long senderAccountNumber;

    @Column(name = "receiver")
    private Long receiverAccountNumber;

    @Column(name = "amount")
    private double amount;

    @Column(name = "time_stamp")
    private LocalDateTime timestamp;

    public Transfer() {

    }

    public Transfer(@Valid Long senderAccountNumber, @Valid Long receiverAccountNumber, @Valid double amount, @Valid LocalDateTime timestamp) {
        if (senderAccountNumber < 0) {
            throw new IllegalArgumentException(
                    "Sender account number must be a positive integer. Provided: " + senderAccountNumber);
        }

        if (receiverAccountNumber < 0) {
            throw new IllegalArgumentException(
                    "Reciever account number must be a positive integer. Provided: " + senderAccountNumber);
        }

        if (amount < 0) {
            throw new IllegalArgumentException(
                    "Amount must be a positive integer. Provided: " + amount);
        }
        this.senderAccountNumber = senderAccountNumber;
        this.receiverAccountNumber = receiverAccountNumber;
        this.amount = amount;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return transferId;
    }

    public Long getSenderAccountNumber() {
        return this.senderAccountNumber;
    }

    public Long getReceiverAccountNumber() {
        return this.receiverAccountNumber;
    }

    public double getAmount() {
        return this.amount;
    }

    public LocalDateTime getTimestamp() {
        return this.timestamp;
    }

}
