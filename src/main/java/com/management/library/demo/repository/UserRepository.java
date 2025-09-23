package com.management.library.demo.repository;

import com.management.library.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface cho User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo username
     */
    Optional<User> findByUsername(String username);

    /**
     * Tìm user theo email
     */
    Optional<User> findByEmail(String email);

    /**
     * Tìm user theo username hoặc email
     */
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);

    /**
     * Kiểm tra username đã tồn tại chưa
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra email đã tồn tại chưa
     */
    boolean existsByEmail(String email);

    /**
     * Tìm tất cả user theo role
     */
    List<User> findByRole(User.Role role);

    /**
     * Tìm user đã được enable
     */
    List<User> findByEnabledTrue();

    /**
     * Tìm user theo tên (first name hoặc last name)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Đếm số user theo role
     */
    long countByRole(User.Role role);

    /**
     * Tìm user admin
     */
    @Query("SELECT u FROM User u WHERE u.role = 'ADMIN'")
    List<User> findAdminUsers();
}