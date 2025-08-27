package com.banking.onlinebanking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AccountRequest {

    @NotBlank
    private String owner;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal balance;

    // Getters and setters
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
