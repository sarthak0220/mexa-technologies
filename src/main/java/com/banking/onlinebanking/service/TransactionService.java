package com.banking.onlinebanking.service;

import com.banking.onlinebanking.model.Account;
import com.banking.onlinebanking.model.Transaction;
import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.repository.AccountRepository;
import com.banking.onlinebanking.repository.TransactionRepository;
import com.banking.onlinebanking.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Transaction makeTransaction(String accountId, Transaction txn, String username) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Check ownership
        if (!acc.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You cannot operate on this account");
        }

        // Perform transaction
        if ("DEBIT".equalsIgnoreCase(txn.getType())) {
            if (acc.getBalance().compareTo(txn.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance");
            }
            acc.setBalance(acc.getBalance().subtract(txn.getAmount()));
        } else if ("CREDIT".equalsIgnoreCase(txn.getType())) {
            acc.setBalance(acc.getBalance().add(txn.getAmount()));
        } else {
            throw new RuntimeException("Invalid transaction type");
        }

        accountRepository.save(acc);

        txn.setId(UUID.randomUUID().toString());
        txn.setAccount(acc);
        return transactionRepository.save(txn);
    }
}
