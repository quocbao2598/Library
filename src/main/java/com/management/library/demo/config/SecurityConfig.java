package com.management.library.demo.config;

import com.management.library.demo.security.JwtAuthenticationFilter;
import com.management.library.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security Configuration với OAuth2 Resource Server và JWT
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Bật @PreAuthorize và @PostAuthorize
public class SecurityConfig {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Password Encoder Bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Provider Bean
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager Bean
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Security Filter Chain Configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF cho stateless JWT authentication
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure authorization rules
            .authorizeHttpRequests(authz -> authz
                // Public endpoints (không cần authentication)
                .requestMatchers("/api/auth/**").permitAll() // Authentication endpoints
                .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll() // Static resources
                .requestMatchers("/*.html", "/", "/index.html").permitAll() // Public HTML pages
                .requestMatchers("/actuator/health").permitAll() // Health check
                
                // Admin only endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // Librarian và Admin có thể quản lý books, members, loans
                .requestMatchers("/api/books/**").hasAnyRole("ADMIN", "LIBRARIAN", "USER") // Users có thể xem sách
                .requestMatchers("/api/members/**").hasAnyRole("ADMIN", "LIBRARIAN")
                .requestMatchers("/api/loans/**").hasAnyRole("ADMIN", "LIBRARIAN")
                
                // Tất cả request khác cần authentication
                .anyRequest().authenticated()
            )
            
            // Configure session management (stateless)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Set authentication provider
            .authenticationProvider(authenticationProvider())
            
            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Configure security headers
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny()) // Prevent clickjacking
                .contentTypeOptions(contentTypeOptions -> contentTypeOptions.disable()) // Allow content type sniffing if needed
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .includeSubDomains(true) // Fixed method name
                    .maxAgeInSeconds(31536000)
                )
            );
        
        return http.build();
    }
}
