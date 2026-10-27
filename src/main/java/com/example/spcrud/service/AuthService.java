
package com.example.spcrud.service;

import com.example.spcrud.dto.AuthResponse;
import com.example.spcrud.dto.LoginRequest;
import com.example.spcrud.dto.UserResponse;
import com.example.spcrud.entity.AppUser;
import com.example.spcrud.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        if (request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException(
                    "Email and password are required.");
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(
                request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException(
                    "Invalid email or password.");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException(
                    "This account has been deactivated. Contact support if you believe this is a mistake.");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name());

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                UserResponse.from(user));
    }
}

