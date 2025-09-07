package com.banking.onlinebanking.service;

import com.banking.onlinebanking.dto.AccountRequest;
import com.banking.onlinebanking.model.Account;
import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.repository.AccountRepository;
import com.banking.onlinebanking.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    // Create account using AccountRequest and JWT username
    public Account createAccount(AccountRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = new Account();
        account.setId(UUID.randomUUID().toString());
        account.setOwner(request.getOwner());
        account.setBalance(request.getBalance());
        account.setCurrency(request.getCurrency());
        account.setUser(user); // associate user automatically

        return accountRepository.save(account);
    }

    public Account getAccount(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }
    // src/main/java/com/banking/onlinebanking/service/AccountService.java (add this)
public List<Account> getAccountsForUser(String username) {
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    return accountRepository.findByUser(user);
}

}
