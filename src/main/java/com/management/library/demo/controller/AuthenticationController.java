package com.management.library.demo.controller;

import com.management.library.demo.dto.*;
import com.management.library.demo.entity.User;
import com.management.library.demo.security.JwtUtil;
import com.management.library.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller để xử lý login, register và refresh token
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Cho phép CORS từ mọi origin (development only)
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Đăng nhập user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request) {
        try {
            // Xác thực user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsernameOrEmail(),
                    request.getPassword()
                )
            );

            // Load user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = (User) userDetails;

            // Generate tokens
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername());

            // Create response
            AuthenticationResponse response = new AuthenticationResponse(
                accessToken,
                refreshToken,
                86400000L, // 24 hours in milliseconds
                user.getUsername(),
                user.getRole().name()
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username/email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Đăng ký user mới
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationRequest request) {
        try {
            // Kiểm tra username đã tồn tại
            if (userService.existsByUsername(request.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Kiểm tra email đã tồn tại
            if (userService.existsByEmail(request.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Tạo user mới
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setRole(request.getRole());

            User savedUser = userService.createUser(user);

            // Generate tokens cho user mới
            String accessToken = jwtUtil.generateToken(savedUser);
            String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUsername());

            // Create response
            AuthenticationResponse response = new AuthenticationResponse(
                accessToken,
                refreshToken,
                86400000L, // 24 hours in milliseconds
                savedUser.getUsername(),
                savedUser.getRole().name()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Refresh access token bằng refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String refreshToken = request.getRefreshToken();

            // Validate refresh token
            if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid refresh token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Extract username từ refresh token
            String username = jwtUtil.extractUsername(refreshToken);

            // Load user
            UserDetails userDetails = userService.loadUserByUsername(username);
            User user = (User) userDetails;

            // Generate new access token
            String newAccessToken = jwtUtil.generateToken(userDetails);

            // Create response
            AuthenticationResponse response = new AuthenticationResponse(
                newAccessToken,
                refreshToken, // Giữ nguyên refresh token
                86400000L, // 24 hours in milliseconds
                user.getUsername(),
                user.getRole().name()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Token refresh failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Logout (client-side chỉ cần xóa token)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin user hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            User user = (User) authentication.getPrincipal();
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("role", user.getRole().name());
            userInfo.put("enabled", user.isEnabled());

            return ResponseEntity.ok(userInfo);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user info: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Health check endpoint cho authentication service
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "Authentication service is running");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(status);
    }
}