package com.placement.analytics.dto;

import com.placement.analytics.model.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public record TierGap(
            TargetTier tier,
            String label,
            double benchmark,
            double gap,
            boolean achieved
    ) {}

    public record ReadinessBreakdown(
            double readinessIndex,
            String readinessBand,
            double assessmentComponent,
            double momentumBonus,
            double codingComponent,
            double skillProgressionComponent,
            double academicMockComponent,
            double recommendationBoost,
            double assessmentAverage,
            double trendSlope,
            double codingWeightedPoints,
            double codingAccuracyAvg,
            int totalProblemsSolved,
            int maxWeeklyStreak,
            TargetTier targetTier,
            double targetBenchmark,
            double gapToTarget,
            List<TierGap> tierGaps
    ) {}

    public record AssessmentRequest(
            @NotBlank @Size(max = 160) String title,
            @NotNull AssessmentCategory category,
            @NotNull @DecimalMin("0.0") Double score,
            @NotNull @DecimalMin("1.0") Double maxScore,
            @DecimalMin("0.0") @DecimalMax("100.0") Double percentile,
            @Min(5) @Max(360) Integer timeTakenMinutes,
            LocalDate takenAt,
            Difficulty difficulty
    ) {}

    public record AssessmentDto(
            Long id,
            String title,
            AssessmentCategory category,
            String categoryLabel,
            double score,
            double maxScore,
            double percentage,
            double percentile,
            int timeTakenMinutes,
            LocalDate takenAt,
            Difficulty difficulty
    ) {
        public static AssessmentDto from(AssessmentRecord r) {
            return new AssessmentDto(
                    r.getId(),
                    r.getTitle(),
                    r.getCategory(),
                    r.getCategory().getLabel(),
                    r.getScore(),
                    r.getMaxScore(),
                    Math.round(r.getPercentageScore() * 10.0) / 10.0,
                    r.getPercentile(),
                    r.getTimeTakenMinutes(),
                    r.getTakenAt(),
                    r.getDifficulty()
            );
        }
    }

    public record CodingActivityRequest(
            @NotBlank @Size(max = 80) String topic,
            @NotNull @Min(0) Integer easySolved,
            @NotNull @Min(0) Integer mediumSolved,
            @NotNull @Min(0) Integer hardSolved,
            @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double accuracyRate,
            @NotNull @DecimalMin("1.0") @DecimalMax("180.0") Double avgSolveMinutes,
            @NotNull @Min(0) @Max(52) Integer weeklyStreak
    ) {}

    public record CodingActivityDto(
            Long id,
            String topic,
            int easySolved,
            int mediumSolved,
            int hardSolved,
            int totalSolved,
            double accuracyRate,
            double avgSolveMinutes,
            int weeklyStreak,
            double masteryScore,
            LocalDateTime updatedAt
    ) {
        public static CodingActivityDto from(CodingActivity c) {
            double weighted = c.getEasySolved() * 1.0 + c.getMediumSolved() * 2.5 + c.getHardSolved() * 4.5;
            double volumeScore = Math.min(100.0, (weighted / 160.0) * 100.0);
            double mastery = Math.round((volumeScore * 0.65 + c.getAccuracyRate() * 0.35) * 10.0) / 10.0;
            return new CodingActivityDto(
                    c.getId(),
                    c.getTopic(),
                    c.getEasySolved(),
                    c.getMediumSolved(),
                    c.getHardSolved(),
                    c.getTotalSolved(),
                    Math.round(c.getAccuracyRate() * 10.0) / 10.0,
                    Math.round(c.getAvgSolveMinutes() * 10.0) / 10.0,
                    c.getWeeklyStreak(),
                    Math.min(100.0, mastery),
                    c.getUpdatedAt()
            );
        }
    }

    public record SkillSnapshotDto(
            Long id,
            String weekLabel,
            LocalDate recordedDate,
            double dsaScore,
            double aptitudeScore,
            double coreCsScore,
            double communicationScore,
            double readinessIndex
    ) {
        public static SkillSnapshotDto from(SkillSnapshot s) {
            return new SkillSnapshotDto(
                    s.getId(),
                    s.getWeekLabel(),
                    s.getRecordedDate(),
                    s.getDsaScore(),
                    s.getAptitudeScore(),
                    s.getCoreCsScore(),
                    s.getCommunicationScore(),
                    s.getReadinessIndex()
            );
        }
    }

    public record RecommendationDto(
            Long id,
            String title,
            String category,
            Priority priority,
            String rationale,
            String actionPlan,
            double estimatedImpactPoints,
            String resourceTag,
            boolean completed,
            LocalDateTime createdAt
    ) {
        public static RecommendationDto from(Recommendation r) {
            return new RecommendationDto(
                    r.getId(),
                    r.getTitle(),
                    r.getCategory(),
                    r.getPriority(),
                    r.getRationale(),
                    r.getActionPlan(),
                    r.getEstimatedImpactPoints(),
                    r.getResourceTag(),
                    Boolean.TRUE.equals(r.getCompleted()),
                    r.getCreatedAt()
            );
        }
    }

    public record MentorFeedbackRequest(
            @NotNull Long studentId,
            @NotBlank @Size(min = 5, max = 1500) String note,
            @NotBlank @Size(max = 80) String focusArea
    ) {}

    public record MentorFeedbackDto(
            Long id,
            Long studentId,
            String studentName,
            String mentorName,
            String note,
            String focusArea,
            LocalDateTime createdAt
    ) {
        public static MentorFeedbackDto from(MentorFeedback f) {
            return new MentorFeedbackDto(
                    f.getId(),
                    f.getStudent().getId(),
                    f.getStudent().getFullName(),
                    f.getMentor().getFullName(),
                    f.getNote(),
                    f.getFocusArea(),
                    f.getCreatedAt()
            );
        }
    }

    public record CategoryAverageDto(
            String category,
            String label,
            double averageScore,
            int attemptCount,
            double bestScore
    ) {}

    public record RadarSkillPoint(
            String skill,
            double score,
            double benchmark
    ) {}

    public record StudentDashboardResponse(
            AuthDtos.UserSummary user,
            ReadinessBreakdown readiness,
            List<SkillSnapshotDto> skillSnapshots,
            List<AssessmentDto> assessments,
            List<CodingActivityDto> codingActivities,
            List<CategoryAverageDto> categoryAverages,
            List<RadarSkillPoint> radarSkills,
            List<RecommendationDto> recommendations,
            List<MentorFeedbackDto> mentorFeedback
    ) {}

    public record TargetTierUpdateRequest(
            @NotNull TargetTier targetTier
    ) {}

    public record SimulatorRequest(
            @DecimalMin("40.0") @DecimalMax("100.0") double targetMockScore,
            @Min(0) @Max(60) int extraMediumProblems,
            @Min(0) @Max(30) int extraHardProblems,
            @DecimalMin("0.0") @DecimalMax("25.0") double coreCsBoostPercent,
            @Min(1) @Max(12) int weeksHorizon,
            @NotNull TargetTier targetTier
    ) {}

    public record SimulatorResponse(
            double currentReadiness,
            double projectedReadiness,
            double delta,
            String projectedBand,
            TargetTier targetTier,
            double targetBenchmark,
            boolean achievesTarget,
            double remainingGap,
            String projectionNarrative,
            List<Map<String, Object>> weeklyTrajectory
    ) {}

    public record CohortStudentSummary(
            Long id,
            String fullName,
            String email,
            String department,
            int batchYear,
            double cgpa,
            TargetTier targetTier,
            int leetcodeSolved,
            double readinessIndex,
            String readinessBand,
            double assessmentAverage,
            double trendSlope,
            int completedRecommendations,
            int totalRecommendations
    ) {}

    public record CohortOverviewResponse(
            int totalStudents,
            double averageReadiness,
            int placementReadyCount,
            int needsAttentionCount,
            double avgLeetcodeSolved,
            Map<String, Long> bandDistribution,
            Map<String, Double> departmentAverages,
            List<CohortStudentSummary> students,
            List<MentorFeedbackDto> recentFeedback
    ) {}

    public record UpdateRoleRequest(
            @NotNull Role role
    ) {}

    public record AdminBenchmarkResponse(
            long totalUsers,
            long totalStudents,
            long totalMentors,
            long totalAdmins,
            long totalAssessments,
            long totalRecommendations,
            double cohortAverageReadiness,
            Map<String, Double> tierBenchmarks,
            String databaseMode,
            List<AuthDtos.UserSummary> users
    ) {}

    public record ToggleRecommendationResponse(
            RecommendationDto recommendation,
            ReadinessBreakdown updatedReadiness
    ) {}
}
