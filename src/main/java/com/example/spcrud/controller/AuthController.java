
package com.example.spcrud.controller;

import com.example.spcrud.dto.AuthResponse;
import com.example.spcrud.dto.LoginRequest;
import com.example.spcrud.dto.RegisterRequest;
import com.example.spcrud.dto.UserResponse;
import com.example.spcrud.entity.AppUser;
import com.example.spcrud.service.AppUserService;
import com.example.spcrud.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AppUserService userService;
    private final AuthService authService;

    public AuthController(
            AppUserService userService,
            AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        try {
            AppUser user = userService.registerUser(
                    request.fullName(),
                    request.email(),
                    request.password());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(UserResponse.from(user));

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", exception.getMessage()));
        }
    }
}

