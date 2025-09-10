package com.banking.onlinebanking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    private String id; // can be UUID (manual signup) or provider "sub" (OAuth2 signup)

    @NotBlank
    @Column(unique = true)
    private String username; // use email as username for OAuth2

    private String password;

    private String role = "USER";

    private String provider;   // e.g., "google", "local"
    private String providerId; // e.g., Google "sub" or UUID for local

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Account> accounts;
}
