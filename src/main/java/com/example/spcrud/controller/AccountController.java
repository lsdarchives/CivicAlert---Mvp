
package com.example.spcrud.controller;

import com.example.spcrud.dto.ChangePasswordRequest;
import com.example.spcrud.dto.DeleteAccountRequest;
import com.example.spcrud.dto.UpdateProfileRequest;
import com.example.spcrud.entity.AppUser;
import com.example.spcrud.service.AccountDeactivationService;
import com.example.spcrud.service.AppUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AppUserService userService;
    private final AccountDeactivationService accountDeactivationService;

    public AccountController(
            AppUserService userService,
            AccountDeactivationService accountDeactivationService) {
        this.userService = userService;
        this.accountDeactivationService = accountDeactivationService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            @AuthenticationPrincipal Jwt jwt) {
        try {
            AppUser user = userService.getUserByEmail(jwt.getSubject());
            return ResponseEntity.ok(profileResponse(user));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateProfileRequest request) {
        try {
            AppUser user = userService.updateFullName(
                    jwt.getSubject(), request.fullName());

            return ResponseEntity.ok(profileResponse(user));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changeMyPassword(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(
                    jwt.getSubject(),
                    request.currentPassword(),
                    request.newPassword());

            return ResponseEntity.ok(
                    Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    // Soft deactivation: the database account and report history are preserved.
    @DeleteMapping("/me")
    public ResponseEntity<?> deactivateAccount(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DeleteAccountRequest request) {
        try {
            accountDeactivationService.deactivate(
                    jwt.getSubject(), request.currentPassword());

            return ResponseEntity.ok(
                    Map.of("message", "Account deactivated successfully."));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", exception.getMessage()));
        }
    }

    private Map<String, Object> profileResponse(AppUser user) {
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "createdAt", user.getCreatedAt().toString()
        );
    }
}
