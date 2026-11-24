package com.placement.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "assessment_records")
public class AssessmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssessmentCategory category;

    @Column(nullable = false)
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 100.0;

    @Column(nullable = false)
    private Double percentile = 75.0;

    @Column(name = "time_taken_minutes", nullable = false)
    private Integer timeTakenMinutes = 45;

    @Column(name = "taken_at", nullable = false)
    private LocalDate takenAt = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty = Difficulty.MEDIUM;

    public AssessmentRecord() {}

    public AssessmentRecord(User user, String title, AssessmentCategory category, Double score,
                            Double maxScore, Double percentile, Integer timeTakenMinutes,
                            LocalDate takenAt, Difficulty difficulty) {
        this.user = user;
        this.title = title;
        this.category = category;
        this.score = score;
        this.maxScore = maxScore;
        this.percentile = percentile;
        this.timeTakenMinutes = timeTakenMinutes;
        this.takenAt = takenAt;
        this.difficulty = difficulty;
    }

    public double getPercentageScore() {
        if (maxScore == null || maxScore <= 0) return 0.0;
        return Math.min(100.0, Math.max(0.0, (score / maxScore) * 100.0));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentCategory getCategory() { return category; }
    public void setCategory(AssessmentCategory category) { this.category = category; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public Double getPercentile() { return percentile; }
    public void setPercentile(Double percentile) { this.percentile = percentile; }

    public Integer getTimeTakenMinutes() { return timeTakenMinutes; }
    public void setTimeTakenMinutes(Integer timeTakenMinutes) { this.timeTakenMinutes = timeTakenMinutes; }

    public LocalDate getTakenAt() { return takenAt; }
    public void setTakenAt(LocalDate takenAt) { this.takenAt = takenAt; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
}
