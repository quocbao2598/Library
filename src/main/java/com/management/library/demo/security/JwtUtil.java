package com.management.library.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Utility class để xử lý JWT tokens
 * Bao gồm: tạo token, xác thực token, extract claims
 */
@Component
public class JwtUtil {

    // Secret key để ký JWT token (nên lưu trong environment variable trong production)
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token hết hạn sau 24 giờ (có thể cấu hình qua application.properties)
    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;

    /**
     * Tạo JWT token từ username
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * Tạo JWT token với additional claims
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Thêm authorities vào claims
        claims.put("authorities", userDetails.getAuthorities());
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Tạo token với claims và subject
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extract username từ token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date từ token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract specific claim từ token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract tất cả claims từ token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Kiểm tra token có hết hạn không
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Xác thực token với UserDetails
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Xác thực token (chỉ kiểm tra signature và expiration)
     */
    public Boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Generate refresh token (có thời gian sống lâu hơn)
     */
    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenType", "refresh");
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration * 7)) // 7 ngày
                .signWith(secretKey)
                .compact();
    }

    /**
     * Kiểm tra xem token có phải là refresh token không
     */
    public Boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("tokenType"));
        } catch (Exception e) {
            return false;
        }
    }
}