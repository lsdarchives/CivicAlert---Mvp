package com.example.spcrud.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
