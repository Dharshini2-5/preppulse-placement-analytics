package com.placement.analytics.service;

import com.placement.analytics.dto.AnalyticsDtos.ReadinessBreakdown;
import com.placement.analytics.model.*;
import com.placement.analytics.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationEngineService {

    private final RecommendationRepository recommendationRepository;
    private final AssessmentRecordRepository assessmentRepository;
    private final CodingActivityRepository codingActivityRepository;
    private final SkillSnapshotRepository skillSnapshotRepository;
    private final ReadinessScoringService readinessScoringService;

    public RecommendationEngineService(
            RecommendationRepository recommendationRepository,
            AssessmentRecordRepository assessmentRepository,
            CodingActivityRepository codingActivityRepository,
            SkillSnapshotRepository skillSnapshotRepository,
            ReadinessScoringService readinessScoringService) {
        this.recommendationRepository = recommendationRepository;
        this.assessmentRepository = assessmentRepository;
        this.codingActivityRepository = codingActivityRepository;
        this.skillSnapshotRepository = skillSnapshotRepository;
        this.readinessScoringService = readinessScoringService;
    }

    @Transactional
    public List<Recommendation> generateRecommendationsForUser(User user) {
        List<AssessmentRecord> assessments = assessmentRepository.findByUserIdOrderByTakenAtAscIdAsc(user.getId());
        List<CodingActivity> coding = codingActivityRepository.findByUserIdOrderByTopicAsc(user.getId());
        List<SkillSnapshot> snapshots = skillSnapshotRepository.findByUserIdOrderByRecordedDateAscIdAsc(user.getId());
        List<Recommendation> existingAll = recommendationRepository.findByUserIdOrderByCompletedAscCreatedAtDesc(user.getId());

        Set<String> completedTitles = existingAll.stream()
                .filter(r -> Boolean.TRUE.equals(r.getCompleted()))
                .map(Recommendation::getTitle)
                .collect(Collectors.toSet());

        // Refresh only incomplete recommendations so user progress is preserved
        recommendationRepository.deleteByUserIdAndCompletedFalse(user.getId());

        ReadinessBreakdown readiness = readinessScoringService.computeReadiness(
                user, assessments, coding, snapshots, existingAll
        );

        List<Recommendation> generated = new ArrayList<>();

        // 1. Analyze weakest assessment categories
        Map<AssessmentCategory, Double> categoryAvgMap = assessments.stream()
                .collect(Collectors.groupingBy(
                        AssessmentRecord::getCategory,
                        Collectors.averagingDouble(AssessmentRecord::getPercentageScore)
                ));

        List<Map.Entry<AssessmentCategory, Double>> sortedCats = categoryAvgMap.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .toList();

        for (int i = 0; i < Math.min(2, sortedCats.size()); i++) {
            AssessmentCategory cat = sortedCats.get(i).getKey();
            double avg = Math.round(sortedCats.get(i).getValue() * 10.0) / 10.0;
            if (avg < 84.0) {
                Priority priority = avg < 65.0 ? Priority.CRITICAL : (avg < 76.0 ? Priority.HIGH : Priority.MEDIUM);
                String title = buildCategoryTitle(cat);
                if (!completedTitles.contains(title)) {
                    generated.add(new Recommendation(
                            user,
                            title,
                            cat.name(),
                            priority,
                            String.format("Your %s assessment average is %.1f%% — below the %.0f%% benchmark required for %s roles.",
                                    cat.getLabel(), avg, user.getTargetTier().getBenchmarkScore(), user.getTargetTier().name()),
                            buildCategoryActionPlan(cat),
                            avg < 65.0 ? 5.2 : 3.6,
                            buildResourceTag(cat),
                            false
                    ));
                }
            }
        }

        // 2. Analyze lowest-accuracy or low-hard coding topic
        coding.stream()
                .min(Comparator.comparingDouble(c -> c.getAccuracyRate() * 0.6 + c.getHardSolved() * 4.0))
                .ifPresent(weakTopic -> {
                    String title = "Deep-Drill " + weakTopic.getTopic() + " Speed & Edge Cases";
                    if (!completedTitles.contains(title)) {
                        Priority priority = weakTopic.getAccuracyRate() < 70.0 ? Priority.HIGH : Priority.MEDIUM;
                        generated.add(new Recommendation(
                                user,
                                title,
                                "DSA_CODING",
                                priority,
                                String.format("%s currently shows %.1f%% accuracy with %d Hard problems solved (avg %.0f min/problem).",
                                        weakTopic.getTopic(), weakTopic.getAccuracyRate(), weakTopic.getHardSolved(), weakTopic.getAvgSolveMinutes()),
                                String.format("Complete a 10-day focused sprint: solve 8 Medium + 4 Hard %s problems under a 30-minute timer, and maintain an error-pattern log for boundary conditions.",
                                        weakTopic.getTopic()),
                                4.1,
                                "LeetCode Pattern Sheet",
                                false
                        ));
                    }
                });

        // 3. Target Tier Gap Workflow (FAANG / Product specific)
        if (readiness.gapToTarget() > 0.5) {
            String tierTitle = "Close " + readiness.gapToTarget() + "-Point Gap to " + user.getTargetTier().name() + " Readiness";
            if (!completedTitles.contains(tierTitle)) {
                Priority p = readiness.gapToTarget() >= 10.0 ? Priority.CRITICAL : Priority.HIGH;
                generated.add(new Recommendation(
                        user,
                        tierTitle,
                        "TIER_STRATEGY",
                        p,
                        String.format("Current Readiness Index is %.1f vs %s threshold of %.0f (gap: %.1f pts).",
                                readiness.readinessIndex(), user.getTargetTier().name(), readiness.targetBenchmark(), readiness.gapToTarget()),
                        user.getTargetTier() == TargetTier.FAANG
                                ? "Run 2 timed FAANG OA simulations per week, elevate Hard problem share above 15%, and conduct 1 peer System Design walkthrough every weekend."
                                : "Take 2 full-length company-specific mock tests weekly, revise SQL window functions + OS concurrency, and push coding accuracy above 82%.",
                        Math.min(6.5, Math.round((readiness.gapToTarget() * 0.6 + 1.5) * 10.0) / 10.0),
                        user.getTargetTier().name() + " Sprint Roadmap",
                        false
                ));
            }
        }

        // 4. Trend Slope / Momentum Watch
        if (readiness.trendSlope() < 0.8) {
            String momentumTitle = "Reverse Assessment Plateau with Timed Post-Mortems";
            if (!completedTitles.contains(momentumTitle)) {
                generated.add(new Recommendation(
                        user,
                        momentumTitle,
                        "MOMENTUM",
                        readiness.trendSlope() < 0 ? Priority.HIGH : Priority.MEDIUM,
                        String.format("Recent 6-assessment trend slope is %+.2f pts/test, indicating score plateauing under exam time pressure.",
                                readiness.trendSlope()),
                        "After every mock test, spend 25 minutes categorizing wrong answers into Concept Gap, Time Pressure, or Careless Error; re-attempt missed problems after 48 hours.",
                        3.2,
                        "Error-Log Playbook",
                        false
                ));
            }
        }

        // 5. Ensure at least 4 actionable insights exist even for top performers
        if (generated.size() < 4) {
            String stretchTitle = "Lead Mock System Design & Behavioral STAR Calibration";
            if (!completedTitles.contains(stretchTitle)) {
                generated.add(new Recommendation(
                        user,
                        stretchTitle,
                        "MOCK_INTERVIEW",
                        Priority.LOW,
                        String.format("Strong baseline (Readiness %.1f). Convert technical mastery into offer-stage execution with structured architecture & STAR communication.",
                                readiness.readinessIndex()),
                        "Document 6 STAR leadership stories from your Spring Boot & full-stack projects and practice 45-minute live whiteboard design sessions (Rate Limiter, Notification Engine, Placement Analytics Pipeline).",
                        2.4,
                        "Offer Conversion Kit",
                        false
                ));
            }
        }

        recommendationRepository.saveAll(generated);
        return recommendationRepository.findByUserIdOrderByCompletedAscCreatedAtDesc(user.getId());
    }

    private String buildCategoryTitle(AssessmentCategory cat) {
        return switch (cat) {
            case SYSTEM_DESIGN -> "Master HLD/LLD Trade-Offs & Scalable Backend Patterns";
            case DSA_CODING -> "Elevate Timed DSA Contest Speed & DP/Graph Patterns";
            case SQL_DBMS -> "Sharpen Complex SQL Joins, Indexing & Query Optimization";
            case CORE_CS -> "Reinforce OS Concurrency, TCP/IP & JVM Internals";
            case APTITUDE -> "Boost Quantitative Speed & Probability Accuracy";
            case MOCK_INTERVIEW -> "Upgrade Live Technical Walkthrough & Behavioral Polish";
        };
    }

    private String buildCategoryActionPlan(AssessmentCategory cat) {
        return switch (cat) {
            case SYSTEM_DESIGN -> "Study Caching, Sharding, Message Queues, and Load Balancing; sketch 3 end-to-end backend architectures per week with bottleneck calculations.";
            case DSA_CODING -> "Participate in weekly 90-minute virtual contests, targeting 3/4 solves using Sliding Window, Shortest Path, and Bitmask/State DP templates.";
            case SQL_DBMS -> "Practice 25 LeetCode/StrataScratch SQL Medium-Hard queries covering CTEs, Window Functions, B-Tree indexing, and ACID isolation anomalies.";
            case CORE_CS -> "Review Deadlocks, Virtual Memory, HTTP/2 vs TLS handshake, and Java Collections internals via spaced-repetition flashcards + 2 timed quizzes.";
            case APTITUDE -> "Drill 30 timed questions daily on Permutations, Time-Speed-Distance, and Data Interpretation aiming for <55 sec/question.";
            case MOCK_INTERVIEW -> "Schedule 2 recorded mock interviews focusing on thinking aloud, complexity trade-offs before coding, and concise project deep-dives.";
        };
    }

    private String buildResourceTag(AssessmentCategory cat) {
        return switch (cat) {
            case SYSTEM_DESIGN -> "System Design Primer";
            case DSA_CODING -> "NeetCode 150 + Contest";
            case SQL_DBMS -> "SQL 50 & MySQL Internals";
            case CORE_CS -> "CS Core Rapid Deck";
            case APTITUDE -> "Quant Speed Drills";
            case MOCK_INTERVIEW -> "Peer Mock Studio";
        };
    }
}
