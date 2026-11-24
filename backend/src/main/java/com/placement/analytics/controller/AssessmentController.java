package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.model.User;
import com.placement.analytics.repository.AssessmentRecordRepository;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AnalyticsService analyticsService;
    private final AssessmentRecordRepository assessmentRepository;

    public AssessmentController(AnalyticsService analyticsService, AssessmentRecordRepository assessmentRepository) {
        this.analyticsService = analyticsService;
        this.assessmentRepository = assessmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<AssessmentDto>> listMyAssessments(Authentication auth) {
        User user = analyticsService.getUserByEmail(auth.getName());
        List<AssessmentDto> list = assessmentRepository.findByUserIdOrderByTakenAtDescIdDesc(user.getId())
                .stream()
                .map(AssessmentDto::from)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<AssessmentDto> logAssessment(
            Authentication auth,
            @Valid @RequestBody AssessmentRequest request) {
        User user = analyticsService.getUserByEmail(auth.getName());
        AssessmentDto saved = analyticsService.addAssessment(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAssessment(Authentication auth, @PathVariable Long id) {
        User user = analyticsService.getUserByEmail(auth.getName());
        analyticsService.deleteAssessment(user, id);
        return ResponseEntity.ok(Map.of("deleted", true, "id", id));
    }
}
