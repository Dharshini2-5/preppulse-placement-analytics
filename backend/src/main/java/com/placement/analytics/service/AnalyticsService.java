package com.placement.analytics.service;

import com.placement.analytics.dto.AnalyticsDtos.*;
import com.placement.analytics.dto.AuthDtos.UserSummary;
import com.placement.analytics.model.*;
import com.placement.analytics.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final AssessmentRecordRepository assessmentRepository;
    private final CodingActivityRepository codingActivityRepository;
    private final SkillSnapshotRepository skillSnapshotRepository;
    private final RecommendationRepository recommendationRepository;
    private final MentorFeedbackRepository mentorFeedbackRepository;
    private final ReadinessScoringService readinessScoringService;
    private final RecommendationEngineService recommendationEngineService;
    private final String databaseMode;

    public AnalyticsService(
            UserRepository userRepository,
            AssessmentRecordRepository assessmentRepository,
            CodingActivityRepository codingActivityRepository,
            SkillSnapshotRepository skillSnapshotRepository,
            RecommendationRepository recommendationRepository,
            MentorFeedbackRepository mentorFeedbackRepository,
            ReadinessScoringService readinessScoringService,
            RecommendationEngineService recommendationEngineService,
            @Value("${app.database.mode:H2 (MySQL-Compatible Mode)}") String databaseMode) {
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
        this.codingActivityRepository = codingActivityRepository;
        this.skillSnapshotRepository = skillSnapshotRepository;
        this.recommendationRepository = recommendationRepository;
        this.mentorFeedbackRepository = mentorFeedbackRepository;
        this.readinessScoringService = readinessScoringService;
        this.recommendationEngineService = recommendationEngineService;
        this.databaseMode = databaseMode;
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard(User user) {
        List<AssessmentRecord> assessmentsAsc = assessmentRepository.findByUserIdOrderByTakenAtAscIdAsc(user.getId());
        List<AssessmentRecord> assessmentsDesc = new ArrayList<>(assessmentsAsc);
        Collections.reverse(assessmentsDesc);

        List<CodingActivity> coding = codingActivityRepository.findByUserIdOrderByTopicAsc(user.getId());
        List<SkillSnapshot> snapshots = skillSnapshotRepository.findByUserIdOrderByRecordedDateAscIdAsc(user.getId());
        List<Recommendation> recommendations = recommendationRepository.findByUserIdOrderByCompletedAscCreatedAtDesc(user.getId());
        List<MentorFeedback> feedback = mentorFeedbackRepository.findByStudentIdOrderByCreatedAtDesc(user.getId());

        ReadinessBreakdown readiness = readinessScoringService.computeReadiness(
                user, assessmentsAsc, coding, snapshots, recommendations
        );

        List<CategoryAverageDto> categoryAverages = buildCategoryAverages(assessmentsAsc);
        List<RadarSkillPoint> radarSkills = buildRadarSkills(assessmentsAsc, coding, user);

        return new StudentDashboardResponse(
                UserSummary.from(user),
                readiness,
                snapshots.stream().map(SkillSnapshotDto::from).toList(),
                assessmentsDesc.stream().map(AssessmentDto::from).toList(),
                coding.stream().map(CodingActivityDto::from).toList(),
                categoryAverages,
                radarSkills,
                recommendations.stream().map(RecommendationDto::from).toList(),
                feedback.stream().map(MentorFeedbackDto::from).toList()
        );
    }

    @Transactional
    public AssessmentDto addAssessment(User user, AssessmentRequest req) {
        if (req.score() > req.maxScore()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score cannot exceed maxScore");
        }
        double pct = (req.score() / req.maxScore()) * 100.0;
        double percentile = req.percentile() != null
                ? req.percentile()
                : Math.min(99.5, Math.max(25.0, Math.round((pct * 0.92 + 7.5) * 10.0) / 10.0));

        AssessmentRecord record = new AssessmentRecord(
                user,
                req.title().trim(),
                req.category(),
                req.score(),
                req.maxScore(),
                percentile,
                req.timeTakenMinutes() != null ? req.timeTakenMinutes() : 45,
                req.takenAt() != null ? req.takenAt() : LocalDate.now(),
                req.difficulty() != null ? req.difficulty() : Difficulty.MEDIUM
        );
        AssessmentRecord saved = assessmentRepository.save(record);
        syncLatestSnapshot(user);
        return AssessmentDto.from(saved);
    }

    @Transactional
    public void deleteAssessment(User user, Long assessmentId) {
        AssessmentRecord record = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assessment not found"));
        if (!record.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete another student's assessment");
        }
        assessmentRepository.delete(record);
        syncLatestSnapshot(user);
    }

    @Transactional
    public CodingActivityDto upsertCodingActivity(User user, CodingActivityRequest req) {
        CodingActivity activity = codingActivityRepository
                .findByUserIdAndTopicIgnoreCase(user.getId(), req.topic().trim())
                .orElseGet(() -> new CodingActivity(
                        user,
                        req.topic().trim(),
                        req.easySolved(),
                        req.mediumSolved(),
                        req.hardSolved(),
                        req.accuracyRate(),
                        req.avgSolveMinutes(),
                        req.weeklyStreak()
                ));

        activity.setEasySolved(req.easySolved());
        activity.setMediumSolved(req.mediumSolved());
        activity.setHardSolved(req.hardSolved());
        activity.setAccuracyRate(req.accuracyRate());
        activity.setAvgSolveMinutes(req.avgSolveMinutes());
        activity.setWeeklyStreak(req.weeklyStreak());
        activity.setUpdatedAt(LocalDateTime.now());

        CodingActivity saved = codingActivityRepository.save(activity);

        // Sync total leetcodeSolved on User
        int totalSolved = codingActivityRepository.findByUserIdOrderByTopicAsc(user.getId())
                .stream()
                .mapToInt(CodingActivity::getTotalSolved)
                .sum();
        user.setLeetcodeSolved(totalSolved);
        userRepository.save(user);
        syncLatestSnapshot(user);

        return CodingActivityDto.from(saved);
    }

    @Transactional
    public UserSummary updateTargetTier(User user, TargetTier tier) {
        user.setTargetTier(tier);
        userRepository.save(user);
        return UserSummary.from(user);
    }

    @Transactional
    public ToggleRecommendationResponse toggleRecommendation(User user, Long recId) {
        Recommendation rec = recommendationRepository.findById(recId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recommendation not found"));
        if (!rec.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        rec.setCompleted(!Boolean.TRUE.equals(rec.getCompleted()));
        recommendationRepository.save(rec);

        ReadinessBreakdown updated = computeBreakdownForUser(user);
        syncLatestSnapshot(user);
        return new ToggleRecommendationResponse(RecommendationDto.from(rec), updated);
    }

    @Transactional(readOnly = true)
    public SimulatorResponse runSimulator(User user, SimulatorRequest req) {
        ReadinessBreakdown current = computeBreakdownForUser(user);
        return readinessScoringService.simulateReadiness(current, req);
    }

    @Transactional(readOnly = true)
    public CohortOverviewResponse getCohortOverview() {
        List<User> students = userRepository.findByRoleOrderByFullNameAsc(Role.STUDENT);
        List<CohortStudentSummary> summaries = new ArrayList<>();

        Map<String, Long> bandDist = new LinkedHashMap<>();
        bandDist.put("Placement Ready", 0L);
        bandDist.put("High Momentum", 0L);
        bandDist.put("Building Core", 0L);
        bandDist.put("Needs Acceleration", 0L);

        Map<String, List<Double>> deptScores = new LinkedHashMap<>();

        for (User student : students) {
            List<AssessmentRecord> assessments = assessmentRepository.findByUserIdOrderByTakenAtAscIdAsc(student.getId());
            List<CodingActivity> coding = codingActivityRepository.findByUserIdOrderByTopicAsc(student.getId());
            List<SkillSnapshot> snapshots = skillSnapshotRepository.findByUserIdOrderByRecordedDateAscIdAsc(student.getId());
            List<Recommendation> recs = recommendationRepository.findByUserIdOrderByCompletedAscCreatedAtDesc(student.getId());

            ReadinessBreakdown rb = readinessScoringService.computeReadiness(student, assessments, coding, snapshots, recs);
            int completedRecs = (int) recs.stream().filter(r -> Boolean.TRUE.equals(r.getCompleted())).count();

            summaries.add(new CohortStudentSummary(
                    student.getId(),
                    student.getFullName(),
                    student.getEmail(),
                    student.getDepartment(),
                    student.getBatchYear(),
                    student.getCgpa(),
                    student.getTargetTier(),
                    rb.totalProblemsSolved(),
                    rb.readinessIndex(),
                    rb.readinessBand(),
                    rb.assessmentAverage(),
                    rb.trendSlope(),
                    completedRecs,
                    recs.size()
            ));

            bandDist.merge(rb.readinessBand(), 1L, Long::sum);
            deptScores.computeIfAbsent(student.getDepartment(), k -> new ArrayList<>()).add(rb.readinessIndex());
        }

        summaries.sort(Comparator.comparingDouble(CohortStudentSummary::readinessIndex).reversed());

        double avgReadiness = summaries.stream().mapToDouble(CohortStudentSummary::readinessIndex).average().orElse(0.0);
        double avgLeetcode = summaries.stream().mapToInt(CohortStudentSummary::leetcodeSolved).average().orElse(0.0);
        int readyCount = (int) summaries.stream().filter(s -> s.readinessIndex() >= 80.0).count();
        int needsAttention = (int) summaries.stream().filter(s -> s.readinessIndex() < 68.0).count();

        Map<String, Double> deptAverages = new LinkedHashMap<>();
        deptScores.forEach((dept, scores) -> {
            double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            deptAverages.put(dept, Math.round(avg * 10.0) / 10.0);
        });

        List<MentorFeedbackDto> recentFeedback = mentorFeedbackRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(MentorFeedbackDto::from)
                .toList();

        return new CohortOverviewResponse(
                summaries.size(),
                Math.round(avgReadiness * 10.0) / 10.0,
                readyCount,
                needsAttention,
                Math.round(avgLeetcode * 10.0) / 10.0,
                bandDist,
                deptAverages,
                summaries,
                recentFeedback
        );
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboardById(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return getStudentDashboard(student);
    }

    @Transactional
    public MentorFeedbackDto addMentorFeedback(User mentor, MentorFeedbackRequest req) {
        User student = userRepository.findById(req.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        MentorFeedback feedback = new MentorFeedback(student, mentor, req.note().trim(), req.focusArea().trim());
        MentorFeedback saved = mentorFeedbackRepository.save(feedback);
        return MentorFeedbackDto.from(saved);
    }

    @Transactional(readOnly = true)
    public AdminBenchmarkResponse getAdminBenchmarks() {
        List<User> allUsers = userRepository.findAll();
        CohortOverviewResponse cohort = getCohortOverview();

        Map<String, Double> tierBenchmarks = new LinkedHashMap<>();
        for (TargetTier t : TargetTier.values()) {
            tierBenchmarks.put(t.name(), t.getBenchmarkScore());
        }

        return new AdminBenchmarkResponse(
                allUsers.size(),
                userRepository.countByRole(Role.STUDENT),
                userRepository.countByRole(Role.MENTOR),
                userRepository.countByRole(Role.ADMIN),
                assessmentRepository.count(),
                recommendationRepository.count(),
                cohort.averageReadiness(),
                tierBenchmarks,
                databaseMode,
                allUsers.stream()
                        .sorted(Comparator.comparing(User::getId))
                        .map(UserSummary::from)
                        .toList()
        );
    }

    @Transactional
    public UserSummary updateUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setRole(role);
        userRepository.save(user);
        return UserSummary.from(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPublicTelemetry() {
        CohortOverviewResponse cohort = getCohortOverview();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("platform", "PrepPulse Analytics");
        stats.put("studentsTracked", cohort.totalStudents());
        stats.put("assessmentsAnalyzed", assessmentRepository.count());
        stats.put("recommendationsGenerated", recommendationRepository.count());
        stats.put("averageReadinessIndex", cohort.averageReadiness());
        stats.put("databaseMode", databaseMode);
        stats.put("status", "OPERATIONAL");
        return stats;
    }

    @Transactional
    public void bootstrapNewStudentData(User user) {
        // Seed starter coding topics & initial snapshot so newly registered accounts immediately show live charts
        List<CodingActivity> starters = List.of(
                new CodingActivity(user, "Arrays & Hashing", 22, 14, 2, 81.0, 21.0, 4),
                new CodingActivity(user, "Trees & Graphs", 12, 10, 1, 72.0, 31.0, 3),
                new CodingActivity(user, "Dynamic Programming", 6, 7, 1, 64.0, 38.0, 2),
                new CodingActivity(user, "SQL & Joins", 16, 11, 2, 79.0, 18.0, 4)
        );
        codingActivityRepository.saveAll(starters);

        List<AssessmentRecord> starterAssessments = List.of(
                new AssessmentRecord(user, "Onboarding DSA Baseline", AssessmentCategory.DSA_CODING, 72.0, 100.0, 74.0, 60, LocalDate.now().minusDays(14), Difficulty.MEDIUM),
                new AssessmentRecord(user, "Core CS & DBMS Diagnostic", AssessmentCategory.CORE_CS, 68.0, 100.0, 70.0, 45, LocalDate.now().minusDays(7), Difficulty.MEDIUM),
                new AssessmentRecord(user, "Aptitude Speed Check", AssessmentCategory.APTITUDE, 76.0, 100.0, 78.0, 40, LocalDate.now().minusDays(2), Difficulty.EASY)
        );
        assessmentRepository.saveAll(starterAssessments);

        user.setLeetcodeSolved(starters.stream().mapToInt(CodingActivity::getTotalSolved).sum());
        userRepository.save(user);

        ReadinessBreakdown rb = computeBreakdownForUser(user);
        skillSnapshotRepository.save(new SkillSnapshot(user, "Wk 1", LocalDate.now().minusWeeks(2), 68.0, 73.0, 65.0, 70.0, Math.max(55.0, rb.readinessIndex() - 4.2)));
        skillSnapshotRepository.save(new SkillSnapshot(user, "Wk 2", LocalDate.now().minusWeeks(1), 71.0, 75.0, 67.5, 72.0, Math.max(58.0, rb.readinessIndex() - 2.0)));
        skillSnapshotRepository.save(new SkillSnapshot(user, "Wk 3", LocalDate.now(), 74.0, 76.0, 69.0, 74.0, rb.readinessIndex()));

        recommendationEngineService.generateRecommendationsForUser(user);
    }

    private ReadinessBreakdown computeBreakdownForUser(User user) {
        return readinessScoringService.computeReadiness(
                user,
                assessmentRepository.findByUserIdOrderByTakenAtAscIdAsc(user.getId()),
                codingActivityRepository.findByUserIdOrderByTopicAsc(user.getId()),
                skillSnapshotRepository.findByUserIdOrderByRecordedDateAscIdAsc(user.getId()),
                recommendationRepository.findByUserIdOrderByCompletedAscCreatedAtDesc(user.getId())
        );
    }

    private void syncLatestSnapshot(User user) {
        ReadinessBreakdown rb = computeBreakdownForUser(user);
        List<SkillSnapshot> snapshots = skillSnapshotRepository.findByUserIdOrderByRecordedDateAscIdAsc(user.getId());
        List<AssessmentRecord> assessments = assessmentRepository.findByUserIdOrderByTakenAtAscIdAsc(user.getId());

        double dsa = categoryAvg(assessments, AssessmentCategory.DSA_CODING, rb.codingComponent() * 3.1);
        double apt = categoryAvg(assessments, AssessmentCategory.APTITUDE, rb.assessmentAverage());
        double core = categoryAvg(assessments, AssessmentCategory.CORE_CS, rb.assessmentAverage());
        double comm = categoryAvg(assessments, AssessmentCategory.MOCK_INTERVIEW, rb.assessmentAverage());

        if (snapshots.isEmpty()) {
            skillSnapshotRepository.save(new SkillSnapshot(user, "Current", LocalDate.now(), round1(dsa), round1(apt), round1(core), round1(comm), rb.readinessIndex()));
        } else {
            SkillSnapshot latest = snapshots.get(snapshots.size() - 1);
            latest.setDsaScore(round1(dsa));
            latest.setAptitudeScore(round1(apt));
            latest.setCoreCsScore(round1(core));
            latest.setCommunicationScore(round1(comm));
            latest.setReadinessIndex(rb.readinessIndex());
            skillSnapshotRepository.save(latest);
        }
    }

    private double categoryAvg(List<AssessmentRecord> assessments, AssessmentCategory cat, double fallback) {
        return assessments.stream()
                .filter(a -> a.getCategory() == cat)
                .mapToDouble(AssessmentRecord::getPercentageScore)
                .average()
                .orElse(Math.min(100.0, fallback));
    }

    private List<CategoryAverageDto> buildCategoryAverages(List<AssessmentRecord> assessments) {
        Map<AssessmentCategory, List<AssessmentRecord>> grouped = assessments.stream()
                .collect(Collectors.groupingBy(AssessmentRecord::getCategory));

        List<CategoryAverageDto> list = new ArrayList<>();
        for (AssessmentCategory cat : AssessmentCategory.values()) {
            List<AssessmentRecord> recs = grouped.getOrDefault(cat, List.of());
            if (!recs.isEmpty()) {
                double avg = recs.stream().mapToDouble(AssessmentRecord::getPercentageScore).average().orElse(0.0);
                double best = recs.stream().mapToDouble(AssessmentRecord::getPercentageScore).max().orElse(0.0);
                list.add(new CategoryAverageDto(cat.name(), cat.getLabel(), round1(avg), recs.size(), round1(best)));
            }
        }
        return list;
    }

    private List<RadarSkillPoint> buildRadarSkills(List<AssessmentRecord> assessments, List<CodingActivity> coding, User user) {
        double benchmark = user.getTargetTier() != null ? user.getTargetTier().getBenchmarkScore() : 78.0;
        double codingAccuracy = coding.stream().mapToDouble(CodingActivity::getAccuracyRate).average().orElse(72.0);
        double dsaAvg = categoryAvg(assessments, AssessmentCategory.DSA_CODING, codingAccuracy);
        double sqlAvg = categoryAvg(assessments, AssessmentCategory.SQL_DBMS, 70.0);
        double coreAvg = categoryAvg(assessments, AssessmentCategory.CORE_CS, 72.0);
        double sysAvg = categoryAvg(assessments, AssessmentCategory.SYSTEM_DESIGN, 68.0);
        double aptAvg = categoryAvg(assessments, AssessmentCategory.APTITUDE, 76.0);
        double mockAvg = categoryAvg(assessments, AssessmentCategory.MOCK_INTERVIEW, 74.0);

        return List.of(
                new RadarSkillPoint("DSA & Coding", round1(dsaAvg * 0.6 + codingAccuracy * 0.4), benchmark),
                new RadarSkillPoint("SQL & DBMS", round1(sqlAvg), benchmark),
                new RadarSkillPoint("Core CS", round1(coreAvg), benchmark),
                new RadarSkillPoint("System Design", round1(sysAvg), Math.max(60.0, benchmark - 4.0)),
                new RadarSkillPoint("Aptitude", round1(aptAvg), benchmark),
                new RadarSkillPoint("Mock Interview", round1(mockAvg), benchmark)
        );
    }

    private double round1(double v) { return Math.round(v * 10.0) / 10.0; }
}
