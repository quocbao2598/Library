package com.management.library.demo.dto;

/**
 * DTO cho authentication request
 */
public class AuthenticationRequest {
    private String usernameOrEmail;
    private String password;

    public AuthenticationRequest() {}

    public AuthenticationRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}