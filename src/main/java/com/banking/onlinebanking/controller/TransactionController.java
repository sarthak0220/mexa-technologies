package com.banking.onlinebanking.controller;

import com.banking.onlinebanking.model.Transaction;
import com.banking.onlinebanking.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Create a transaction for the logged-in user's account
    @PostMapping("/{accountId}")
    public Transaction make(@PathVariable String accountId,
                            @Valid @RequestBody Transaction txn,
                            Principal principal) {
        // Pass the username from JWT to service
        return transactionService.makeTransaction(accountId, txn, principal.getName());
    }

    // // Optional: Get all transactions for an account (owned by the logged-in user)
    // @GetMapping("/{accountId}")
    // public List<Transaction> getTransactions(@PathVariable String accountId, Principal principal) {
    //     return transactionService.getTransactionsForAccount(accountId, principal.getName());
    // }
}
