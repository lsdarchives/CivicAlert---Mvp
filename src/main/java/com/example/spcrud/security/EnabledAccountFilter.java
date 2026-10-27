
package com.example.spcrud.security;

import com.example.spcrud.entity.AppUser;
import com.example.spcrud.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class EnabledAccountFilter extends OncePerRequestFilter {

    private final AppUserRepository userRepository;

    public EnabledAccountFilter(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof Jwt jwt) {

            String email = jwt.getSubject();

            AppUser user = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElse(null);

            if (user == null || !user.isEnabled()) {
                SecurityContextHolder.clearContext();
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "This account is disabled or no longer exists.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
