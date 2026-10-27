
package com.example.spcrud.service;

import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.Role;
import com.example.spcrud.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountDeactivationService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountDeactivationService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void deactivate(String email, String currentPassword) {
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Enter your current password to deactivate your account.");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Account not found."));

        if (user.getRole() != Role.ROLE_USER) {
            throw new IllegalArgumentException(
                    "Administrator accounts cannot be deactivated here.");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This account is already deactivated.");
        }

        if (!passwordEncoder.matches(
                currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "The current password is incorrect.");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }
}
