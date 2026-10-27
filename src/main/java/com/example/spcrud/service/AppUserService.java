package com.example.spcrud.service;

import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.Role;
import com.example.spcrud.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AppUserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser registerUser(String fullName, String email, String rawPassword) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Full name is required.");
        }

        if (fullName.trim().length() > 100) {
            throw new IllegalArgumentException(
                    "Full name must not exceed 100 characters.");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        if (rawPassword == null || rawPassword.length() < 8) {
            throw new IllegalArgumentException("Password must contain at least 8 characters.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists.");
        }

        AppUser user = new AppUser();
        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));

        // Public registration must never grant an admin role.
        user.setRole(Role.ROLE_USER);

        return userRepository.save(user);
    }

    public AppUser getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated user email is missing.");
        }

        return userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "User account was not found."));
    }

    @Transactional
    public AppUser updateFullName(String email, String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException(
                    "Full name is required.");
        }

        String cleanedName = fullName.trim();

        if (cleanedName.length() > 100) {
            throw new IllegalArgumentException(
                    "Full name must not exceed 100 characters.");
        }

        AppUser user = getUserByEmail(email);
        user.setFullName(cleanedName);

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(
            String email,
            String currentPassword,
            String newPassword) {

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Current password is required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "New password must contain at least 8 characters.");
        }

        AppUser user = getUserByEmail(email);

        if (!passwordEncoder.matches(
                currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "Current password is incorrect.");
        }

        if (passwordEncoder.matches(
                newPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "New password must be different from the current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
