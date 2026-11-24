package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.dto.AuthDtos.UserSummary;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AnalyticsService analyticsService;

    public AdminController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/benchmarks")
    public ResponseEntity<AdminBenchmarkResponse> benchmarks() {
        return ResponseEntity.ok(analyticsService.getAdminBenchmarks());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserSummary>> users() {
        return ResponseEntity.ok(analyticsService.getAdminBenchmarks().users());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserSummary> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(analyticsService.updateUserRole(id, request.role()));
    }
}
