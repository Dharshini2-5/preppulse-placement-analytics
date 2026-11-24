package com.placement.analytics.controller;

import com.placement.analytics.dto.AuthDtos.*;
import com.placement.analytics.model.Role;
import com.placement.analytics.model.TargetTier;
import com.placement.analytics.model.User;
import com.placement.analytics.repository.UserRepository;
import com.placement.analytics.security.JwtService;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AnalyticsService analyticsService;
    private final long jwtExpirationMs;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AnalyticsService analyticsService,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.analyticsService = analyticsService;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, "Bearer", jwtExpirationMs, UserSummary.from(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        Role requestedRole = request.role() != null ? request.role() : Role.STUDENT;
        // Self-registration defaults to STUDENT or MENTOR; Admin accounts are promoted by existing Admins
        Role assignedRole = requestedRole == Role.ADMIN ? Role.STUDENT : requestedRole;

        User user = new User(
                request.fullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                assignedRole,
                request.department() != null && !request.department().isBlank() ? request.department().trim() : "CSE",
                request.batchYear() != null ? request.batchYear() : 2026,
                request.cgpa() != null ? request.cgpa() : 8.0,
                request.targetTier() != null ? request.targetTier() : TargetTier.PRODUCT,
                0
        );
        User saved = userRepository.save(user);

        if (saved.getRole() == Role.STUDENT) {
            analyticsService.bootstrapNewStudentData(saved);
        }

        String token = jwtService.generateToken(saved);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, "Bearer", jwtExpirationMs, UserSummary.from(saved)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = analyticsService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(UserSummary.from(user));
    }
}
