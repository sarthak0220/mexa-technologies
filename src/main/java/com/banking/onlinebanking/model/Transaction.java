package com.banking.onlinebanking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "transaction")
@Getter
@Setter
public class Transaction {

    @Id
    @Column(length = 36)
    private String id = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY) // Transaction belongs to Account
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account;

    @Column(nullable = false, length = 10)
    private String type; // CREDIT / DEBIT

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    private String status;

    private String narration;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt = LocalDateTime.now();
}
