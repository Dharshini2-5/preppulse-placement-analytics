package com.placement.analytics.service;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.model.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReadinessScoringService {

    public ReadinessBreakdown computeReadiness(
            User user,
            List<AssessmentRecord> assessmentsAsc,
            List<CodingActivity> codingActivities,
            List<SkillSnapshot> snapshotsAsc,
            List<Recommendation> recommendations) {

        // 1. Weighted Assessment Average (35% weight)
        double assessmentAvg = computeWeightedAssessmentAverage(assessmentsAsc);
        double assessmentComponent = (assessmentAvg / 100.0) * 35.0;

        // 2. Assessment Trend Momentum Bonus (up to 10% weight)
        double trendSlope = computeTrendSlope(assessmentsAsc);
        // Base 5.0 pts at neutral slope (0), scales between 1.0 and 10.0
        double momentumBonus = clamp(5.5 + trendSlope * 1.15, 1.0, 10.0);

        // 3. Difficulty-Weighted Coding Analytics (30% weight)
        double codingWeightedPoints = 0.0;
        double accuracySum = 0.0;
        int totalSolved = 0;
        int maxStreak = 0;
        for (CodingActivity ca : codingActivities) {
            int easy = safeInt(ca.getEasySolved());
            int med = safeInt(ca.getMediumSolved());
            int hard = safeInt(ca.getHardSolved());
            codingWeightedPoints += easy * 1.0 + med * 2.5 + hard * 4.5;
            totalSolved += easy + med + hard;
            accuracySum += ca.getAccuracyRate() != null ? ca.getAccuracyRate() : 0.0;
            maxStreak = Math.max(maxStreak, safeInt(ca.getWeeklyStreak()));
        }
        if (totalSolved == 0 && user.getLeetcodeSolved() != null && user.getLeetcodeSolved() > 0) {
            totalSolved = user.getLeetcodeSolved();
            codingWeightedPoints = totalSolved * 1.8;
        }
        double avgAccuracy = codingActivities.isEmpty() ? 70.0 : (accuracySum / codingActivities.size());
        // 1050 weighted points ~ top FAANG readiness (e.g. 160 easy + 280 med + 72 hard = 1184)
        double volumeNormalized = clamp((codingWeightedPoints / 1050.0) * 100.0, 0.0, 100.0);
        double streakNormalized = clamp((maxStreak / 14.0) * 100.0, 0.0, 100.0);
        double codingComposite = volumeNormalized * 0.62 + avgAccuracy * 0.26 + streakNormalized * 0.12;
        double codingComponent = (codingComposite / 100.0) * 30.0;

        // 4. Skill Progression Consistency & Core CS Mastery (15% weight)
        double coreCsScore = computeCoreCsAndProgressionScore(assessmentsAsc, snapshotsAsc);
        double skillProgressionComponent = (coreCsScore / 100.0) * 15.0;

        // 5. Academic Baseline (CGPA) & Mock Interview Performance (10% weight)
        double cgpaNorm = clamp(((user.getCgpa() != null ? user.getCgpa() : 7.5) / 10.0) * 100.0, 40.0, 100.0);
        double mockAvg = assessmentsAsc.stream()
                .filter(a -> a.getCategory() == AssessmentCategory.MOCK_INTERVIEW)
                .mapToDouble(AssessmentRecord::getPercentageScore)
                .average()
                .orElse(assessmentAvg > 0 ? assessmentAvg * 0.94 : 68.0);
        double academicMockComponent = ((cgpaNorm * 0.45 + mockAvg * 0.55) / 100.0) * 10.0;

        // 6. Completed Recommendation Workflow Boost (up to +3.5 pts)
        double completedImpact = recommendations.stream()
                .filter(r -> Boolean.TRUE.equals(r.getCompleted()))
                .mapToDouble(r -> r.getEstimatedImpactPoints() != null ? r.getEstimatedImpactPoints() * 0.35 : 0.6)
                .sum();
        double recommendationBoost = clamp(completedImpact, 0.0, 3.5);

        double rawReadiness = assessmentComponent + momentumBonus + codingComponent
                + skillProgressionComponent + academicMockComponent + recommendationBoost;
        double readinessIndex = round1(clamp(rawReadiness, 15.0, 99.5));

        String band = classifyBand(readinessIndex);
        TargetTier targetTier = user.getTargetTier() != null ? user.getTargetTier() : TargetTier.PRODUCT;
        double targetBenchmark = targetTier.getBenchmarkScore();
        double gapToTarget = round1(Math.max(0.0, targetBenchmark - readinessIndex));

        List<TierGap> tierGaps = Arrays.stream(TargetTier.values())
                .map(tier -> new TierGap(
                        tier,
                        tier.getDisplayLabel(),
                        tier.getBenchmarkScore(),
                        round1(Math.max(0.0, tier.getBenchmarkScore() - readinessIndex)),
                        readinessIndex >= tier.getBenchmarkScore()
                ))
                .toList();

        return new ReadinessBreakdown(
                readinessIndex,
                band,
                round1(assessmentComponent),
                round1(momentumBonus),
                round1(codingComponent),
                round1(skillProgressionComponent),
                round1(academicMockComponent),
                round1(recommendationBoost),
                round1(assessmentAvg),
                round2(trendSlope),
                round1(codingWeightedPoints),
                round1(avgAccuracy),
                totalSolved,
                maxStreak,
                targetTier,
                targetBenchmark,
                gapToTarget,
                tierGaps
        );
    }

    public SimulatorResponse simulateReadiness(ReadinessBreakdown current, SimulatorRequest req) {
        // Compute projected lift from improved mocks, additional Medium/Hard problems, and Core CS boost
        double mockDelta = Math.max(0.0, req.targetMockScore() - current.assessmentAverage()) * 0.38;
        double extraWeightedPoints = req.extraMediumProblems() * 2.5 + req.extraHardProblems() * 4.5;
        double currentVolNorm = clamp((current.codingWeightedPoints() / 1050.0) * 100.0, 0.0, 100.0);
        double newVolNorm = clamp(((current.codingWeightedPoints() + extraWeightedPoints) / 1050.0) * 100.0, 0.0, 100.0);
        double codingLift = ((newVolNorm - currentVolNorm) * 0.62 / 100.0) * 30.0
                + Math.min(2.2, (req.extraHardProblems() * 0.12 + req.extraMediumProblems() * 0.04));

        double coreCsLift = (req.coreCsBoostPercent() / 100.0) * 15.0;
        double consistencyLift = Math.min(2.5, req.weeksHorizon() * 0.32);

        double projected = round1(clamp(
                current.readinessIndex() + mockDelta + codingLift + coreCsLift + consistencyLift,
                current.readinessIndex(),
                99.5
        ));
        double delta = round1(projected - current.readinessIndex());
        double benchmark = req.targetTier().getBenchmarkScore();
        boolean achieves = projected >= benchmark;
        double remainingGap = round1(Math.max(0.0, benchmark - projected));
        String projectedBand = classifyBand(projected);

        List<Map<String, Object>> trajectory = new ArrayList<>();
        int weeks = Math.max(1, req.weeksHorizon());
        for (int w = 0; w <= weeks; w++) {
            double progress = (double) w / weeks;
            // Slightly front-loaded learning curve
            double curve = Math.pow(progress, 0.85);
            double scoreAtWeek = round1(current.readinessIndex() + delta * curve);
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("week", w == 0 ? "Now" : "Wk +" + w);
            point.put("projected", scoreAtWeek);
            point.put("benchmark", benchmark);
            trajectory.add(point);
        }

        String narrative = achieves
                ? String.format("Executing +%d Medium & +%d Hard problems with %.0f%% target mock scores lifts readiness by +%.1f pts over %d weeks — crossing the %s benchmark (%.0f).",
                req.extraMediumProblems(), req.extraHardProblems(), req.targetMockScore(), delta, weeks, req.targetTier().name(), benchmark)
                : String.format("This sprint lifts your score by +%.1f pts to %.1f (%s), leaving %.1f pts to reach %s readiness (%.0f). Add more Hard DSA problems or timed mocks to close the gap.",
                delta, projected, projectedBand, remainingGap, req.targetTier().name(), benchmark);

        return new SimulatorResponse(
                current.readinessIndex(),
                projected,
                delta,
                projectedBand,
                req.targetTier(),
                benchmark,
                achieves,
                remainingGap,
                narrative,
                trajectory
        );
    }

    public String classifyBand(double readinessIndex) {
        if (readinessIndex >= 84.0) return "Placement Ready";
        if (readinessIndex >= 72.0) return "High Momentum";
        if (readinessIndex >= 58.0) return "Building Core";
        return "Needs Acceleration";
    }

    private double computeWeightedAssessmentAverage(List<AssessmentRecord> assessments) {
        if (assessments == null || assessments.isEmpty()) return 62.0;

        double weightedSum = 0.0;
        double totalWeight = 0.0;
        int n = assessments.size();

        for (int i = 0; i < n; i++) {
            AssessmentRecord r = assessments.get(i);
            // Newer assessments carry higher weight (recency factor 1.0 -> 1.8)
            double recencyWeight = 1.0 + (n > 1 ? 0.8 * ((double) i / (n - 1)) : 0.4);
            double diffMultiplier = switch (r.getDifficulty()) {
                case HARD -> 1.25;
                case MEDIUM -> 1.05;
                case EASY -> 0.88;
            };
            double w = recencyWeight * diffMultiplier;
            weightedSum += r.getPercentageScore() * w;
            totalWeight += w;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 62.0;
    }

    private double computeTrendSlope(List<AssessmentRecord> assessmentsAsc) {
        if (assessmentsAsc == null || assessmentsAsc.size() < 2) return 0.5;
        // Take last 6 assessments for short-term momentum linear regression slope
        int start = Math.max(0, assessmentsAsc.size() - 6);
        List<AssessmentRecord> recent = assessmentsAsc.subList(start, assessmentsAsc.size());
        int n = recent.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            double x = i;
            double y = recent.get(i).getPercentageScore();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }
        double denom = n * sumX2 - sumX * sumX;
        if (Math.abs(denom) < 1e-6) return 0.0;
        return (n * sumXY - sumX * sumY) / denom;
    }

    private double computeCoreCsAndProgressionScore(List<AssessmentRecord> assessmentsAsc, List<SkillSnapshot> snapshotsAsc) {
        double coreAvg = assessmentsAsc.stream()
                .filter(a -> a.getCategory() == AssessmentCategory.CORE_CS
                        || a.getCategory() == AssessmentCategory.SQL_DBMS
                        || a.getCategory() == AssessmentCategory.SYSTEM_DESIGN)
                .mapToDouble(AssessmentRecord::getPercentageScore)
                .average()
                .orElse(66.0);

        double progressionBonus = 70.0;
        if (snapshotsAsc != null && snapshotsAsc.size() >= 2) {
            SkillSnapshot first = snapshotsAsc.get(0);
            SkillSnapshot last = snapshotsAsc.get(snapshotsAsc.size() - 1);
            double growth = last.getReadinessIndex() - first.getReadinessIndex();
            progressionBonus = clamp(68.0 + growth * 1.4, 45.0, 100.0);
        }
        return coreAvg * 0.65 + progressionBonus * 0.35;
    }

    private int safeInt(Integer v) { return v != null ? v : 0; }
    private double clamp(double v, double min, double max) { return Math.max(min, Math.min(max, v)); }
    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}
