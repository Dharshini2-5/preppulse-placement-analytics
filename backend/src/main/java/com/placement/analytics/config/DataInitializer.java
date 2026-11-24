package com.placement.analytics.config;

import com.placement.analytics.model.*;
import com.placement.analytics.repository.*;
import com.placement.analytics.service.RecommendationEngineService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssessmentRecordRepository assessmentRepository;
    private final CodingActivityRepository codingActivityRepository;
    private final SkillSnapshotRepository skillSnapshotRepository;
    private final MentorFeedbackRepository mentorFeedbackRepository;
    private final RecommendationEngineService recommendationEngineService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            AssessmentRecordRepository assessmentRepository,
            CodingActivityRepository codingActivityRepository,
            SkillSnapshotRepository skillSnapshotRepository,
            MentorFeedbackRepository mentorFeedbackRepository,
            RecommendationEngineService recommendationEngineService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
        this.codingActivityRepository = codingActivityRepository;
        this.skillSnapshotRepository = skillSnapshotRepository;
        this.mentorFeedbackRepository = mentorFeedbackRepository;
        this.recommendationEngineService = recommendationEngineService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() >= 8) {
            return;
        }

        // Mentor & Admin accounts (idempotent per email)
        User mentor = userRepository.findByEmailIgnoreCase("mentor@placement.edu")
                .orElseGet(() -> userRepository.save(new User(
                        "Dr. Karthik Sundaram",
                        "mentor@placement.edu",
                        passwordEncoder.encode("Mentor@123"),
                        Role.MENTOR,
                        "Placement & Training Cell",
                        2026,
                        9.5,
                        TargetTier.FAANG,
                        0
                )));

        if (!userRepository.existsByEmailIgnoreCase("admin@placement.edu")) {
            userRepository.save(new User(
                    "Placement Cell Director",
                    "admin@placement.edu",
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN,
                    "CUIC Anna University",
                    2026,
                    9.8,
                    TargetTier.FAANG,
                    0
            ));
        }

        // 1. Dharshini A — Featured Student Profile (Anna University ECE, CGPA 8.2, 512 LeetCode, FAANG Target)
        if (!userRepository.existsByEmailIgnoreCase("dharshini@placement.edu")) {
            User dharshini = userRepository.save(new User(
                    "Dharshini A",
                    "dharshini@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "ECE",
                    2026,
                    8.2,
                    TargetTier.FAANG,
                    512
            ));
            seedDharshini(dharshini, mentor);
        }

        // 2. Arjun Krishnan — Placement Ready (CSE, CGPA 8.9, 620 LeetCode, FAANG)
        if (!userRepository.existsByEmailIgnoreCase("arjun@placement.edu")) {
            User arjun = userRepository.save(new User(
                    "Arjun Krishnan",
                    "arjun@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "CSE",
                    2026,
                    8.9,
                    TargetTier.FAANG,
                    620
            ));
            seedStudentCohortProfile(arjun, mentor, 89, 86, 88, 84, 92, 87, 1.15,
                    "Outstanding DP & System Design clarity. Ready for Day-1 product & FAANG interview loops.", "System Design & Offer Prep");
        }

        // 3. Priya Narayanan — High Momentum (IT, CGPA 8.4, 385 LeetCode, PRODUCT)
        if (!userRepository.existsByEmailIgnoreCase("priya@placement.edu")) {
            User priya = userRepository.save(new User(
                    "Priya Narayanan",
                    "priya@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "IT",
                    2026,
                    8.4,
                    TargetTier.PRODUCT,
                    385
            ));
            seedStudentCohortProfile(priya, mentor, 80, 76, 82, 74, 83, 79, 0.78,
                    "Strong SQL & Core CS consistency. Push Hard graph problems to unlock tier-1 product shortlists.", "Graphs & Timed OA");
        }

        // 4. Vigneshwar M — High Momentum (AI&DS, CGPA 8.7, 470 LeetCode, FAANG)
        if (!userRepository.existsByEmailIgnoreCase("vignesh@placement.edu")) {
            User vignesh = userRepository.save(new User(
                    "Vigneshwar M",
                    "vignesh@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "AI&DS",
                    2026,
                    8.7,
                    TargetTier.FAANG,
                    470
            ));
            seedStudentCohortProfile(vignesh, mentor, 84, 81, 79, 77, 85, 76, 0.92,
                    "Great algorithmic speed. Allocate 30% of prep to behavioral STAR stories and OS concurrency.", "Core CS & Behavioral");
        }

        // 5. Karthikeyan S — Building Core (ECE, CGPA 7.6, 240 LeetCode, PRODUCT)
        if (!userRepository.existsByEmailIgnoreCase("karthikeyan@placement.edu")) {
            User karthikeyan = userRepository.save(new User(
                    "Karthikeyan S",
                    "karthikeyan@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "ECE",
                    2026,
                    7.6,
                    TargetTier.PRODUCT,
                    240
            ));
            seedStudentCohortProfile(karthikeyan, mentor, 68, 64, 71, 61, 74, 65, 0.52,
                    "Good aptitude base. Needs focused 3-week sprint on Sliding Window, Trees, and DBMS indexing.", "DSA Patterns & DBMS");
        }

        // 6. Meenakshi R — Needs Acceleration (CSE, CGPA 7.1, 145 LeetCode, SERVICE)
        if (!userRepository.existsByEmailIgnoreCase("meenakshi@placement.edu")) {
            User meenakshi = userRepository.save(new User(
                    "Meenakshi R",
                    "meenakshi@placement.edu",
                    passwordEncoder.encode("Student@123"),
                    Role.STUDENT,
                    "CSE",
                    2026,
                    7.1,
                    TargetTier.SERVICE,
                    145
            ));
            seedStudentCohortProfile(meenakshi, mentor, 58, 54, 63, 52, 65, 57, 0.34,
                    "Prioritize daily 2-problem DSA consistency and timed quantitative drills before campus drives.", "Foundational DSA & Quant");
        }
    }

    private void seedDharshini(User u, User mentor) {
        LocalDate today = LocalDate.now();

        // 16 rich assessments showing upward momentum with realistic improvement opportunities in System Design & Hard DP
        assessmentRepository.saveAll(List.of(
                new AssessmentRecord(u, "Week 1 Quantitative & Logical Sprint", AssessmentCategory.APTITUDE, 76.0, 100.0, 79.0, 42, today.minusDays(52), Difficulty.EASY),
                new AssessmentRecord(u, "Arrays, Hashing & Two-Pointers OA", AssessmentCategory.DSA_CODING, 82.0, 100.0, 86.5, 65, today.minusDays(48), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Operating Systems & Deadlocks Quiz", AssessmentCategory.CORE_CS, 74.0, 100.0, 77.0, 38, today.minusDays(44), Difficulty.MEDIUM),
                new AssessmentRecord(u, "MySQL Joins & Normalization Lab Test", AssessmentCategory.SQL_DBMS, 81.0, 100.0, 84.0, 45, today.minusDays(40), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Trees, BFS & Shortest Path Contest", AssessmentCategory.DSA_CODING, 79.0, 100.0, 83.0, 75, today.minusDays(36), Difficulty.HARD),
                new AssessmentRecord(u, "System Design Baseline: URL Shortener", AssessmentCategory.SYSTEM_DESIGN, 67.0, 100.0, 71.0, 50, today.minusDays(32), Difficulty.HARD),
                new AssessmentRecord(u, "Mock Technical Interview Round 1", AssessmentCategory.MOCK_INTERVIEW, 78.0, 100.0, 81.5, 45, today.minusDays(28), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Probability & Permutation Speed Test", AssessmentCategory.APTITUDE, 85.0, 100.0, 88.0, 35, today.minusDays(25), Difficulty.MEDIUM),
                new AssessmentRecord(u, "OOP, Java Collections & Concurrency", AssessmentCategory.CORE_CS, 84.0, 100.0, 87.0, 40, today.minusDays(21), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Dynamic Programming & Memoization OA", AssessmentCategory.DSA_CODING, 81.0, 100.0, 86.0, 80, today.minusDays(18), Difficulty.HARD),
                new AssessmentRecord(u, "Window Functions & Query Plans Test", AssessmentCategory.SQL_DBMS, 88.0, 100.0, 91.5, 40, today.minusDays(15), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Product Company Full-Length OA #1", AssessmentCategory.DSA_CODING, 87.0, 100.0, 91.0, 90, today.minusDays(12), Difficulty.MEDIUM),
                new AssessmentRecord(u, "System Design HLD: Rate Limiter & Cache", AssessmentCategory.SYSTEM_DESIGN, 73.0, 100.0, 77.5, 55, today.minusDays(9), Difficulty.HARD),
                new AssessmentRecord(u, "Computer Networks & HTTP/TLS Deep Check", AssessmentCategory.CORE_CS, 86.0, 100.0, 89.5, 36, today.minusDays(6), Difficulty.MEDIUM),
                new AssessmentRecord(u, "FAANG Mock Technical + Behavioral Round", AssessmentCategory.MOCK_INTERVIEW, 84.0, 100.0, 88.5, 50, today.minusDays(3), Difficulty.HARD),
                new AssessmentRecord(u, "Timed Sliding Window & Graph Final OA", AssessmentCategory.DSA_CODING, 91.0, 100.0, 94.5, 72, today.minusDays(1), Difficulty.HARD)
        ));

        // 8 coding topics summing to exactly 512 solved problems (186 Easy + 258 Medium + 68 Hard = 512)
        codingActivityRepository.saveAll(List.of(
                new CodingActivity(u, "Arrays & Hashing", 46, 52, 10, 89.5, 16.5, 11),
                new CodingActivity(u, "Trees & Graphs", 26, 44, 14, 83.0, 26.0, 10),
                new CodingActivity(u, "Dynamic Programming", 14, 34, 16, 72.5, 34.5, 9),
                new CodingActivity(u, "Sliding Window", 24, 32, 7, 87.0, 19.0, 11),
                new CodingActivity(u, "SQL & Joins", 30, 34, 8, 91.0, 14.5, 8),
                new CodingActivity(u, "System Design", 10, 16, 4, 71.0, 39.0, 6),
                new CodingActivity(u, "OOP & Java", 22, 26, 5, 88.0, 17.5, 9),
                new CodingActivity(u, "OS & Networking", 14, 20, 4, 84.5, 20.0, 7)
        ));

        // 8-week skill progression snapshots
        skillSnapshotRepository.saveAll(List.of(
                new SkillSnapshot(u, "Wk 1", today.minusWeeks(7), 71.0, 75.0, 70.0, 72.0, 70.4),
                new SkillSnapshot(u, "Wk 2", today.minusWeeks(6), 74.5, 76.5, 72.5, 74.0, 73.1),
                new SkillSnapshot(u, "Wk 3", today.minusWeeks(5), 76.0, 78.0, 74.0, 75.5, 75.2),
                new SkillSnapshot(u, "Wk 4", today.minusWeeks(4), 78.5, 80.0, 77.5, 77.0, 77.8),
                new SkillSnapshot(u, "Wk 5", today.minusWeeks(3), 81.0, 82.0, 79.0, 79.5, 79.9),
                new SkillSnapshot(u, "Wk 6", today.minusWeeks(2), 83.5, 83.5, 81.5, 81.0, 81.8),
                new SkillSnapshot(u, "Wk 7", today.minusWeeks(1), 85.5, 84.5, 83.5, 83.0, 83.6),
                new SkillSnapshot(u, "Wk 8", today, 87.5, 85.5, 85.0, 84.5, 85.2)
        ));

        mentorFeedbackRepository.saveAll(List.of(
                new MentorFeedback(u, mentor,
                        "Impressive +14.8 pt readiness progression over 8 weeks and 512 LeetCode solves! Your Spring Boot & SQL fundamentals stand out strongly. Focus the next two weeks on HLD System Design trade-offs and Hard DP optimization to break the 88+ FAANG benchmark.",
                        "System Design & Hard DP"),
                new MentorFeedback(u, mentor,
                        "Strong articulation during the Mock Technical Round. Remember to vocalize time/space complexity before writing helper functions.",
                        "Mock Interview Communication")
        ));

        recommendationEngineService.generateRecommendationsForUser(u);
    }

    private void seedStudentCohortProfile(
            User u, User mentor,
            double dsa, double sys, double sql, double core, double apt, double mock,
            double codingScale, String feedbackNote, String focusArea) {

        LocalDate today = LocalDate.now();
        assessmentRepository.saveAll(List.of(
                new AssessmentRecord(u, "Aptitude Diagnostic", AssessmentCategory.APTITUDE, Math.max(40, apt - 4), 100.0, apt - 2, 40, today.minusDays(42), Difficulty.EASY),
                new AssessmentRecord(u, "DSA Core Online Assessment", AssessmentCategory.DSA_CODING, Math.max(40, dsa - 5), 100.0, dsa - 1, 70, today.minusDays(34), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Core CS Fundamentals Check", AssessmentCategory.CORE_CS, Math.max(40, core - 3), 100.0, core, 42, today.minusDays(27), Difficulty.MEDIUM),
                new AssessmentRecord(u, "SQL & Indexing Practical", AssessmentCategory.SQL_DBMS, sql, 100.0, sql + 1, 45, today.minusDays(20), Difficulty.MEDIUM),
                new AssessmentRecord(u, "System Design Architecture Case", AssessmentCategory.SYSTEM_DESIGN, sys, 100.0, sys - 2, 55, today.minusDays(14), Difficulty.HARD),
                new AssessmentRecord(u, "Mock Technical Interview", AssessmentCategory.MOCK_INTERVIEW, mock, 100.0, mock + 1, 48, today.minusDays(8), Difficulty.MEDIUM),
                new AssessmentRecord(u, "Campus Drive Simulation OA", AssessmentCategory.DSA_CODING, Math.min(98, dsa + 3), 100.0, Math.min(99, dsa + 4), 75, today.minusDays(2), Difficulty.HARD)
        ));

        codingActivityRepository.saveAll(List.of(
                new CodingActivity(u, "Arrays & Hashing", (int) (40 * codingScale), (int) (45 * codingScale), (int) (10 * codingScale), Math.min(95, dsa + 2), 18.0, (int) Math.max(2, 10 * codingScale)),
                new CodingActivity(u, "Trees & Graphs", (int) (24 * codingScale), (int) (38 * codingScale), (int) (12 * codingScale), Math.min(93, dsa - 3), 27.0, (int) Math.max(2, 9 * codingScale)),
                new CodingActivity(u, "Dynamic Programming", (int) (14 * codingScale), (int) (28 * codingScale), (int) (13 * codingScale), Math.min(90, dsa - 9), 35.0, (int) Math.max(1, 7 * codingScale)),
                new CodingActivity(u, "Sliding Window", (int) (20 * codingScale), (int) (28 * codingScale), (int) (6 * codingScale), Math.min(94, dsa), 20.0, (int) Math.max(2, 8 * codingScale)),
                new CodingActivity(u, "SQL & Joins", (int) (26 * codingScale), (int) (30 * codingScale), (int) (7 * codingScale), Math.min(95, sql + 1), 16.0, (int) Math.max(2, 8 * codingScale)),
                new CodingActivity(u, "System Design", (int) (8 * codingScale), (int) (14 * codingScale), (int) (4 * codingScale), Math.min(89, sys - 2), 38.0, (int) Math.max(1, 5 * codingScale)),
                new CodingActivity(u, "OOP & Java", (int) (18 * codingScale), (int) (24 * codingScale), (int) (4 * codingScale), Math.min(94, core + 2), 19.0, (int) Math.max(2, 7 * codingScale)),
                new CodingActivity(u, "OS & Networking", (int) (12 * codingScale), (int) (18 * codingScale), (int) (3 * codingScale), Math.min(92, core), 22.0, (int) Math.max(1, 6 * codingScale))
        ));

        double base = (dsa + apt + core + mock) / 4.0;
        skillSnapshotRepository.saveAll(List.of(
                new SkillSnapshot(u, "Wk 1", today.minusWeeks(7), dsa - 10, apt - 7, core - 8, mock - 8, base - 9),
                new SkillSnapshot(u, "Wk 2", today.minusWeeks(6), dsa - 8, apt - 6, core - 7, mock - 7, base - 7.5),
                new SkillSnapshot(u, "Wk 3", today.minusWeeks(5), dsa - 6.5, apt - 5, core - 5.5, mock - 6, base - 6),
                new SkillSnapshot(u, "Wk 4", today.minusWeeks(4), dsa - 5, apt - 4, core - 4, mock - 4.5, base - 4.5),
                new SkillSnapshot(u, "Wk 5", today.minusWeeks(3), dsa - 3.5, apt - 3, core - 3, mock - 3, base - 3),
                new SkillSnapshot(u, "Wk 6", today.minusWeeks(2), dsa - 2, apt - 2, core - 2, mock - 2, base - 1.8),
                new SkillSnapshot(u, "Wk 7", today.minusWeeks(1), dsa - 1, apt - 1, core - 1, mock - 1, base - 0.8),
                new SkillSnapshot(u, "Wk 8", today, dsa, apt, core, mock, base)
        ));

        mentorFeedbackRepository.save(new MentorFeedback(u, mentor, feedbackNote, focusArea));
        recommendationEngineService.generateRecommendationsForUser(u);
    }
}
