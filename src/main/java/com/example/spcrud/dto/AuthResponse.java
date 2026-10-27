
package com.example.spcrud.dto;

public record AuthResponse(String token, String tokenType, long expiresIn, UserResponse user) {
}
