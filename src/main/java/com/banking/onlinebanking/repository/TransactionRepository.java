package com.banking.onlinebanking.repository;

import com.banking.onlinebanking.model.Account;
import com.banking.onlinebanking.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByAccountId(String accountId);
    List<Transaction> findByAccount(Account account);
}
