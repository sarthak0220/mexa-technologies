package com.banking.onlinebanking.repository;

import com.banking.onlinebanking.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.banking.onlinebanking.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUserId(String userId);
     List<Account> findByUser(User user);
}
