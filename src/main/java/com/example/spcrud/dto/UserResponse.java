package com.example.spcrud.dto;

import com.example.spcrud.entity.AppUser;
import com.example.spcrud.entity.Role;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}

