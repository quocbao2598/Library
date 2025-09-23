package com.management.library.demo.controller;

import com.management.library.demo.entity.Loan;
import com.management.library.demo.entity.User;
import com.management.library.demo.service.LoanService;
import com.management.library.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User Controller để USER quản lý profile của chính mình
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private LoanService loanService;

    /**
     * Lấy thông tin profile của user hiện tại
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Cập nhật thông tin profile của user hiện tại
     */
    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> updateProfile(@RequestBody User userDetails, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // User chỉ có thể cập nhật một số thông tin cá nhân
            currentUser.setFirstName(userDetails.getFirstName());
            currentUser.setLastName(userDetails.getLastName());
            currentUser.setEmail(userDetails.getEmail());
            
            User updatedUser = userService.updateUser(currentUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Thay đổi password của user hiện tại
     */
    @PostMapping("/change-password")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordRequest, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            String oldPassword = passwordRequest.get("oldPassword");
            String newPassword = passwordRequest.get("newPassword");
            
            userService.changePassword(currentUser.getUsername(), oldPassword, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Lấy dashboard data cho user dựa trên role
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> dashboard = new HashMap<>();
        
        // Common info for all users
        dashboard.put("username", currentUser.getUsername());
        dashboard.put("role", currentUser.getRole().name());
        dashboard.put("fullName", currentUser.getFullName());
        
        // Role-specific dashboard data
        switch (currentUser.getRole()) {
            case USER:
                // TODO: Add user-specific dashboard data
                // - My borrowed books
                // - Due dates
                // - Reading history
                dashboard.put("type", "USER_DASHBOARD");
                dashboard.put("features", new String[]{"view_books", "view_my_loans", "return_books"});
                break;
                
            case LIBRARIAN:
                // TODO: Add librarian-specific dashboard data
                // - Books management
                // - Member management
                // - Loan management
                dashboard.put("type", "LIBRARIAN_DASHBOARD");
                dashboard.put("features", new String[]{"manage_books", "manage_members", "manage_loans", "view_reports"});
                break;
                
            case ADMIN:
                // TODO: Add admin-specific dashboard data
                // - System statistics
                // - User management
                // - Full system access
                dashboard.put("type", "ADMIN_DASHBOARD");
                dashboard.put("features", new String[]{"manage_users", "system_settings", "full_access"});
                break;
        }
        
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Lấy menu/navigation items dựa trên role của user
     */
    @GetMapping("/navigation")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNavigation(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Map<String, Object> navigation = new HashMap<>();
        
        switch (currentUser.getRole()) {
            case USER:
                navigation.put("menuItems", new String[]{
                    "Dashboard", "Browse Books", "My Loans", "Profile"
                });
                navigation.put("allowedPages", new String[]{
                    "/dashboard", "/books", "/my-loans", "/profile"
                });
                break;
                
            case LIBRARIAN:
                navigation.put("menuItems", new String[]{
                    "Dashboard", "Books Management", "Members", "Loans", "Reports", "Profile"
                });
                navigation.put("allowedPages", new String[]{
                    "/dashboard", "/books", "/members", "/loans", "/reports", "/profile"
                });
                break;
                
            case ADMIN:
                navigation.put("menuItems", new String[]{
                    "Dashboard", "User Management", "Books", "Members", "Loans", "Reports", "Settings", "Profile"
                });
                navigation.put("allowedPages", new String[]{
                    "/admin", "/users", "/books", "/members", "/loans", "/reports", "/settings", "/profile"
                });
                break;
        }
        
        return ResponseEntity.ok(navigation);
    }
    
    /**
     * Lấy danh sách phiếu mượn của user hiện tại
     */
    @GetMapping("/my-loans")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<Loan>> getMyLoans(Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            List<Loan> loans = loanService.getLoansByUserId(currentUser.getId());
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}