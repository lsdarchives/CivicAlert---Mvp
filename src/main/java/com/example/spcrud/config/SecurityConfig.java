
package com.example.spcrud.config;

import java.util.List;

import com.example.spcrud.security.EnabledAccountFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final EnabledAccountFilter enabledAccountFilter;

    public SecurityConfig(EnabledAccountFilter enabledAccountFilter) {
        this.enabledAccountFilter = enabledAccountFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtConverter =
                new JwtAuthenticationConverter();

        jwtConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        http
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // Authentication
                        .requestMatchers("/api/auth/**").permitAll()

                        // Resident reports
                        .requestMatchers(HttpMethod.GET, "/api/reports/mine")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/reports/community")
                        .hasAnyRole("USER", "ADMIN")

                        // Community comments
                        .requestMatchers(
                                HttpMethod.GET, "/api/reports/*/comments")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST, "/api/reports/*/comments")
                        .hasAnyRole("USER", "ADMIN")

                        // Community reactions
                        .requestMatchers(
                                HttpMethod.GET, "/api/reports/*/reactions")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT, "/api/reports/*/reactions")
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE, "/api/reports/*/reactions")
                        .hasAnyRole("USER", "ADMIN")

                        // Admin: view reports
                        .requestMatchers(
                                HttpMethod.GET, "/api/reports", "/api/reports/{id}")
                        .hasRole("ADMIN")

                        // Create reports
                        .requestMatchers(HttpMethod.POST, "/api/reports")
                        .hasAnyRole("USER", "ADMIN")

                        // Admin: manage reports
                        .requestMatchers(HttpMethod.PUT, "/api/reports/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/api/reports/**")
                        .hasRole("ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/reports/**")
                        .hasRole("ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtConverter)))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        // Check whether the JWT's account is still enabled
        http.addFilterAfter(
                enabledAccountFilter,
                BearerTokenAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:8081",
                "http://127.0.0.1:8081",
                "http://localhost:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type"
        ));

        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


