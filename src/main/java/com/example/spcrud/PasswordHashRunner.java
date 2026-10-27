package com.example.spcrud;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashRunner {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("BCrypt hash: " + encoder.encode(args[0]));
    }
}
