package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.model.User;
import com.placement.analytics.repository.CodingActivityRepository;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coding")
public class CodingActivityController {

    private final AnalyticsService analyticsService;
    private final CodingActivityRepository codingActivityRepository;

    public CodingActivityController(AnalyticsService analyticsService, CodingActivityRepository codingActivityRepository) {
        this.analyticsService = analyticsService;
        this.codingActivityRepository = codingActivityRepository;
    }

    @GetMapping
    public ResponseEntity<List<CodingActivityDto>> listCodingActivities(Authentication auth) {
        User user = analyticsService.getUserByEmail(auth.getName());
        List<CodingActivityDto> list = codingActivityRepository.findByUserIdOrderByTopicAsc(user.getId())
                .stream()
                .map(CodingActivityDto::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<CodingActivityDto> upsertCodingActivity(
            Authentication auth,
            @Valid @RequestBody CodingActivityRequest request) {
        User user = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(analyticsService.upsertCodingActivity(user, request));
    }
}
