package com.banking.onlinebanking.controller;

import com.banking.onlinebanking.dto.AccountRequest;
import com.banking.onlinebanking.model.Account;
import com.banking.onlinebanking.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }
    

    // Create account using AccountRequest and JWT user
    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody AccountRequest request,
                                                 Principal principal) {
        // principal.getName() will return the username from JWT
        Account account = accountService.createAccount(request, principal.getName());
        return ResponseEntity.ok(account);
    }
      @GetMapping
    public List<Account> listMyAccounts(Principal principal) {
        return accountService.getAccountsForUser(principal.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccount(@PathVariable String id) {
        Account account = accountService.getAccount(id);
        return ResponseEntity.ok(account);
    }
}
