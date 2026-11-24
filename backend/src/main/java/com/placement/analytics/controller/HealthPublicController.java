package com.placement.analytics.controller;

import com.placement.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthPublicController {

    private final AnalyticsService analyticsService;

    public HealthPublicController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PrepPulse Analytics API",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/public/stats")
    public ResponseEntity<Map<String, Object>> publicStats() {
        return ResponseEntity.ok(analyticsService.getPublicTelemetry());
    }
}
