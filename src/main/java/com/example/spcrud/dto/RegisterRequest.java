
package com.example.spcrud.dto;

public record RegisterRequest(
        String fullName,
        String email,
        String password
) {
}
