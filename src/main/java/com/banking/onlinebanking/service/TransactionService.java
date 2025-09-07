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

import java.util.List;
import java.util.UUID;
@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(AccountRepository accountRepository,
                              TransactionRepository transactionRepository,
                              UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

 @Transactional
public Transaction makeTransaction(String accountId, Transaction txn, String username) {
    // Find logged-in user
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Ensure the account belongs to this user
    Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

    if (!account.getUser().getId().equals(user.getId())) {
        throw new AccessDeniedException("You are not the owner of this account");
    }

    // Set initial status
    txn.setStatus("PENDING");
    txn.setId(UUID.randomUUID().toString());
    txn.setAccount(account);

    // Update balance based on type
    if ("DEBIT".equalsIgnoreCase(txn.getType())) {
        if (account.getBalance().compareTo(txn.getAmount()) < 0) {
            txn.setStatus("FAILED");
            transactionRepository.save(txn);
            throw new RuntimeException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(txn.getAmount()));
    } else if ("CREDIT".equalsIgnoreCase(txn.getType())) {
        account.setBalance(account.getBalance().add(txn.getAmount()));
    } else {
        txn.setStatus("FAILED");
        transactionRepository.save(txn);
        throw new RuntimeException("Invalid transaction type");
    }

    // Mark transaction as SUCCESS
    txn.setStatus("SUCCESS");
    accountRepository.save(account);

    return transactionRepository.save(txn);
}


    public List<Transaction> getTransactionsForAccount(String accountId, String username) {
    Account acc = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found"));

    if (!acc.getUser().getUsername().equals(username)) {
        throw new RuntimeException("Unauthorized access to this account");
    }

    return transactionRepository.findByAccount(acc);
}

}
