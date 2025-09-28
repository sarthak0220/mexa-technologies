package com.banking.onlinebanking.controller;

import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.security.JwtUtil;
import com.banking.onlinebanking.service.UserService;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

     @GetMapping("/hello")
    public String sayHello() {
        return "Hello, this is a secured GET endpoint!";
    }

    private final AuthenticationManager authManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authManager, UserService userService, JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

 @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody User user) {
    try {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(Map.of("error", "Invalid credentials"));
    }

    String token = jwtUtil.generateToken(user.getUsername());

    // Fetch the user from DB to get the role
    User dbUser = userService.findByUsername(user.getUsername())
                             .orElseThrow(() -> new RuntimeException("User not found"));

    // Return both token and role
    return ResponseEntity.ok(Map.of(
        "token", token,
        "role", dbUser.getRole()
    ));
}

}
