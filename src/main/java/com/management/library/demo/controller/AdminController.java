package com.management.library.demo.controller;

import com.management.library.demo.entity.User;
import com.management.library.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Admin Controller để quản lý users và system administration
 * Chỉ ADMIN có thể truy cập các endpoints này
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // Tất cả endpoints đều cần ADMIN role
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * Lấy danh sách tất cả users
     */
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    /**
     * Lấy user theo ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tạo user mới (Admin có thể tạo user với bất kỳ role nào)
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }

    /**
     * Cập nhật user
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            Optional<User> optionalUser = userService.findById(id);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setUsername(userDetails.getUsername());
                user.setEmail(userDetails.getEmail());
                user.setFirstName(userDetails.getFirstName());
                user.setLastName(userDetails.getLastName());
                user.setRole(userDetails.getRole());
                user.setEnabled(userDetails.isEnabled());
                
                User updatedUser = userService.updateUser(user);
                return ResponseEntity.ok(updatedUser);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
    }

    /**
     * Xóa user
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (userService.findById(id).isPresent()) {
                userService.deleteUser(id);
                Map<String, String> response = new HashMap<>();
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Thay đổi role của user
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleRequest) {
        try {
            String newRole = roleRequest.get("role");
            Optional<User> userOpt = userService.findById(id);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                userService.changeUserRole(user.getUsername(), User.Role.valueOf(newRole));
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "User role updated successfully");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change user role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Enable/Disable user
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusRequest) {
        try {
            Boolean enabled = statusRequest.get("enabled");
            Optional<User> userOpt = userService.findById(id);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                userService.setUserEnabled(user.getUsername(), enabled);
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "User status updated successfully");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Lấy users theo role
     */
    @GetMapping("/users/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return userService.findUsersByRole(userRole);
        } catch (IllegalArgumentException e) {
            return List.of(); // Return empty list if invalid role
        }
    }

    /**
     * Thống kê users
     */
    @GetMapping("/users/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<User> allUsers = userService.findAllUsers();
        stats.put("totalUsers", allUsers.size());
        stats.put("adminCount", userService.findUsersByRole(User.Role.ADMIN).size());
        stats.put("librarianCount", userService.findUsersByRole(User.Role.LIBRARIAN).size());
        stats.put("userCount", userService.findUsersByRole(User.Role.USER).size());
        stats.put("enabledUsers", allUsers.stream().filter(User::isEnabled).count());
        stats.put("disabledUsers", allUsers.stream().filter(user -> !user.isEnabled()).count());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Reset password cho user (Admin function)
     */
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> passwordRequest) {
        try {
            String newPassword = passwordRequest.get("newPassword");
            Optional<User> userOpt = userService.findById(id);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(newPassword);
                userService.updateUser(user);
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password reset successfully");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to reset password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}