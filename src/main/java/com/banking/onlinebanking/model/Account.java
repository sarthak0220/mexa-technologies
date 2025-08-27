package com.banking.onlinebanking.model;
import java.util.ArrayList;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Data
public class Account {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    // @JsonIgnore
    private User user; // link to User entity

    @NotBlank(message = "Currency cannot be blank")
    @Size(min = 3, max = 3)
    private String currency;

    @NotNull
    private BigDecimal balance = BigDecimal.ZERO;

    @NotBlank(message = "Owner cannot be blank")
    private String owner;

    private String status = "ACTIVE";

    @Version
    private int version;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<Transaction> transactions=new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
    }
}
