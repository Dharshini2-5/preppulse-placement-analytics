package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.dto.AuthDtos.UserSummary;
import com.placement.analytics.model.User;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final AnalyticsService analyticsService;

    public DashboardController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard/me")
    public ResponseEntity<StudentDashboardResponse> myDashboard(Authentication auth) {
        User user = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(analyticsService.getStudentDashboard(user));
    }

    @PutMapping("/dashboard/target-tier")
    public ResponseEntity<UserSummary> updateTargetTier(
            Authentication auth,
            @Valid @RequestBody TargetTierUpdateRequest request) {
        User user = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(analyticsService.updateTargetTier(user, request.targetTier()));
    }

    @PostMapping("/simulator/readiness")
    public ResponseEntity<SimulatorResponse> simulateReadiness(
            Authentication auth,
            @Valid @RequestBody SimulatorRequest request) {
        User user = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(analyticsService.runSimulator(user, request));
    }
}
