package com.banking.onlinebanking.security;

import com.banking.onlinebanking.model.User;
import com.banking.onlinebanking.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId(); // "google"

        // Extract OpenID Connect claims
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String sub = (String) attributes.get("sub");     // unique user id
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");

        // Check if user exists
        Optional<User> existingUser = userRepository.findByUsername(email);
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User();
            user.setId(sub);                // ✅ must not be null
            user.setUsername(email);        // safer to use email than name
            user.setPassword("");           // not needed for OAuth2 login
            user.setRole("USER");
            user.setProvider(provider);
            user.setProviderId(sub);

            userRepository.save(user);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        // Redirect with token
        response.sendRedirect("http://localhost:5173/index.html?token=" + token);
    }
}
