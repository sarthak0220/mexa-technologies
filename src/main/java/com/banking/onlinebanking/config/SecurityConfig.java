package com.banking.onlinebanking.config;

import com.banking.onlinebanking.security.JwtFilter;
import com.banking.onlinebanking.security.OAuth2LoginSuccessHandler;
import com.banking.onlinebanking.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    private final UserService userService;

    public SecurityConfig(UserService userService) {
        this.userService = userService;
    }


    

    @Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
        }
    };
}


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(userService)
                   .passwordEncoder(passwordEncoder());
        return authBuilder.build();
    }

    @Bean
public SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter,
                                       OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> {}) // enable CORS from the WebMvcConfigurer above
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/actuator/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/accounts/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/accounts").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/transactions/**").authenticated()
            .requestMatchers("/api/transactions/**").authenticated()
            .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
            .anyRequest().authenticated()
        )
        .oauth2Login(oauth -> oauth.successHandler(oAuth2LoginSuccessHandler)); // <-- semicolon here

    // Add JWT filter before UsernamePasswordAuthenticationFilter
    http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}


}
