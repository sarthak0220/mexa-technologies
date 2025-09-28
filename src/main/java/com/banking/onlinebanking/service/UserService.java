package com.banking.onlinebanking.service;

import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // For manual registration (non-OAuth2)
    public User register(User user) {
        user.setId(UUID.randomUUID().toString()); // local UUID
        user.setProvider("local");
        user.setProviderId(user.getId());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // add this inside UserService
public Optional<User> findByUsername(String username) {
    return userRepository.findByUsername(username);
}


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword() == null ? "" : user.getPassword())
                .roles(user.getRole())
                .build();
    }
}
