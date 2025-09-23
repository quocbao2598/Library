package com.management.library.demo.service;

import com.management.library.demo.entity.User;
import com.management.library.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service để quản lý User và tích hợp với Spring Security
 */
@Service
@Transactional
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Load user by username (được sử dụng bởi Spring Security)
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * Tạo user mới
     */
    public User createUser(User user) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }

        // Mã hóa password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        return userRepository.save(user);
    }

    /**
     * Tìm user theo ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Tìm user theo username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Tìm user theo email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Tìm tất cả users
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Tìm user theo role
     */
    public List<User> findUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    /**
     * Cập nhật user
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Xóa user
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Thay đổi password
     */
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Kiểm tra password cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }

        // Cập nhật password mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Enable/Disable user
     */
    public void setUserEnabled(String username, boolean enabled) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    /**
     * Thay đổi role của user
     */
    public void changeUserRole(String username, User.Role newRole) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        user.setRole(newRole);
        userRepository.save(user);
    }

    /**
     * Kiểm tra username có tồn tại không
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Kiểm tra email có tồn tại không
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Xác thực user với username/email và password
     */
    public boolean authenticateUser(String usernameOrEmail, String password) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return passwordEncoder.matches(password, user.getPassword()) && user.isEnabled();
        }
        return false;
    }

    /**
     * Tạo admin user mặc định (dùng cho initialization)
     */
    public User createDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@library.com");
            admin.setPassword("admin123"); // Sẽ được mã hóa trong createUser
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(User.Role.ADMIN);
            return createUser(admin);
        }
        return userRepository.findByUsername("admin").orElse(null);
    }
}