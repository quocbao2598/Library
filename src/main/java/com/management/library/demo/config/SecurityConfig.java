package com.management.library.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API calls
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/**").permitAll() // Allow all API calls
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll() // Allow static resources
                .requestMatchers("/*.html", "/", "/index.html", "/books.html", "/members.html", "/loans.html").permitAll() // Allow HTML pages
                .anyRequest().permitAll() // Allow all other requests for demo purposes
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny())); // Security headers
        
        return http.build();
    }
}
