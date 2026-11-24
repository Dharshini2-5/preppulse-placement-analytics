package com.placement.analytics.controller;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.model.User;
import com.placement.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cohort")
@PreAuthorize("hasAnyRole('MENTOR','ADMIN')")
public class CohortController {

    private final AnalyticsService analyticsService;

    public CohortController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<CohortOverviewResponse> overview() {
        return ResponseEntity.ok(analyticsService.getCohortOverview());
    }

    @GetMapping("/students")
    public ResponseEntity<List<CohortStudentSummary>> students() {
        return ResponseEntity.ok(analyticsService.getCohortOverview().students());
    }

    @GetMapping("/students/{id}/analytics")
    public ResponseEntity<StudentDashboardResponse> studentAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getStudentDashboardById(id));
    }

    @PostMapping("/feedback")
    public ResponseEntity<MentorFeedbackDto> postFeedback(
            Authentication auth,
            @Valid @RequestBody MentorFeedbackRequest request) {
        User mentor = analyticsService.getUserByEmail(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(analyticsService.addMentorFeedback(mentor, request));
    }
}
