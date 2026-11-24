package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.model.User;
import com.placement.analytics.repository.RecommendationRepository;
import com.placement.analytics.service.AnalyticsService;
import com.placement.analytics.service.RecommendationEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final AnalyticsService analyticsService;
    private final RecommendationEngineService recommendationEngineService;
    private final RecommendationRepository recommendationRepository;

    public RecommendationController(
            AnalyticsService analyticsService,
            RecommendationEngineService recommendationEngineService,
            RecommendationRepository recommendationRepository) {
        this.analyticsService = analyticsService;
        this.recommendationEngineService = recommendationEngineService;
        this.recommendationRepository = recommendationRepository;
    }

    @GetMapping
    public ResponseEntity<List<RecommendationDto>> listRecommendations(Authentication auth) {
        User user = analyticsService.getUserByEmail(auth.getName());
        List<RecommendationDto> list = recommendationRepository
                .findByUserIdOrderByCompletedAscCreatedAtDesc(user.getId())
                .stream()
                .map(RecommendationDto::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/generate")
    public ResponseEntity<List<RecommendationDto>> generateRecommendations(Authentication auth) {
        User user = analyticsService.getUserByEmail(auth.getName());
        List<RecommendationDto> generated = recommendationEngineService
                .generateRecommendationsForUser(user)
                .stream()
                .map(RecommendationDto::from)
                .toList();
        return ResponseEntity.ok(generated);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ToggleRecommendationResponse> toggleRecommendation(
            Authentication auth,
            @PathVariable Long id) {
        User user = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.ok(analyticsService.toggleRecommendation(user, id));
    }
}
