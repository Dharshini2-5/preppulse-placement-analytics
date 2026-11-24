package com.placement.analytics.dto;

import com.placement.analytics.model.Role;
import com.placement.analytics.model.TargetTier;
import com.placement.analytics.model.User;
import jakarta.validation.constraints.*;

public class AuthDtos {

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            String department,
            @Min(2024) @Max(2032) Integer batchYear,
            @DecimalMin("5.0") @DecimalMax("10.0") Double cgpa,
            TargetTier targetTier,
            Role role
    ) {}

    public record UserSummary(
            Long id,
            String fullName,
            String email,
            Role role,
            String department,
            Integer batchYear,
            Double cgpa,
            TargetTier targetTier,
            Integer leetcodeSolved
    ) {
        public static UserSummary from(User user) {
            return new UserSummary(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getDepartment(),
                    user.getBatchYear(),
                    user.getCgpa(),
                    user.getTargetTier(),
                    user.getLeetcodeSolved()
            );
        }
    }

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresInMs,
            UserSummary user
    ) {}
}
