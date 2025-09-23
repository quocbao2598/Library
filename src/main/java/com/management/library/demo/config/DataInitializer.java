package com.management.library.demo.config;

import com.management.library.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Initialization Component
 * Tạo admin user mặc định khi ứng dụng khởi động
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        initializeDefaultAdmin();
    }

    /**
     * Tạo admin user mặc định nếu chưa tồn tại
     */
    private void initializeDefaultAdmin() {
        try {
            userService.createDefaultAdmin();
            System.out.println("✅ Default admin user created/verified:");
            System.out.println("   Username: admin");
            System.out.println("   Password: admin123");
            System.out.println("   Email: admin@library.com");
            System.out.println("   Role: ADMIN");
            System.out.println("⚠️  Remember to change the default password in production!");
        } catch (Exception e) {
            System.err.println("❌ Failed to create default admin user: " + e.getMessage());
        }
    }
}