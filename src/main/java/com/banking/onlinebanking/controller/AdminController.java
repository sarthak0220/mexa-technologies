package com.banking.onlinebanking.controller;

import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.model.Account;
import com.banking.onlinebanking.model.Transaction;
import com.banking.onlinebanking.repository.UserRepository;
import com.banking.onlinebanking.repository.AccountRepository;
import com.banking.onlinebanking.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // Only ADMIN role can access
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(UserRepository userRepository,
                           AccountRepository accountRepository,
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // 🔹 Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Get single user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Update user (username, role, provider if needed)
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    user.setRole(updatedUser.getRole());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok("User deleted successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 List all accounts
    @GetMapping("/accounts")
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @GetMapping("/transactions")
        public List<Transaction> getAllTransactions(){
            return transactionRepository.findAll();
        }
    
    // 🔹 List accounts for a specific user
    @GetMapping("/accounts/{userId}")
    public ResponseEntity<List<Account>> getAccountsByUser(@PathVariable String userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(accountRepository.findByUser(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 List transactions for a specific account
    @GetMapping("/transactions/{accountId}")
    public ResponseEntity<List<Transaction>> getTransactionsByAccount(@PathVariable String accountId) {
        return accountRepository.findById(accountId)
                .map(account -> ResponseEntity.ok(transactionRepository.findByAccount(account)))
                .orElse(ResponseEntity.notFound().build());
    }
}
