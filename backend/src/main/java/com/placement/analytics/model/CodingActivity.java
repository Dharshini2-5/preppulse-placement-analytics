package com.placement.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_activities", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "topic"})
})
public class CodingActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String topic;

    @Column(name = "easy_solved", nullable = false)
    private Integer easySolved = 0;

    @Column(name = "medium_solved", nullable = false)
    private Integer mediumSolved = 0;

    @Column(name = "hard_solved", nullable = false)
    private Integer hardSolved = 0;

    @Column(name = "accuracy_rate", nullable = false)
    private Double accuracyRate = 75.0;

    @Column(name = "avg_solve_minutes", nullable = false)
    private Double avgSolveMinutes = 25.0;

    @Column(name = "weekly_streak", nullable = false)
    private Integer weeklyStreak = 3;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CodingActivity() {}

    public CodingActivity(User user, String topic, Integer easySolved, Integer mediumSolved,
                          Integer hardSolved, Double accuracyRate, Double avgSolveMinutes,
                          Integer weeklyStreak) {
        this.user = user;
        this.topic = topic;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.accuracyRate = accuracyRate;
        this.avgSolveMinutes = avgSolveMinutes;
        this.weeklyStreak = weeklyStreak;
        this.updatedAt = LocalDateTime.now();
    }

    public int getTotalSolved() {
        return (easySolved != null ? easySolved : 0)
             + (mediumSolved != null ? mediumSolved : 0)
             + (hardSolved != null ? hardSolved : 0);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Integer getEasySolved() { return easySolved; }
    public void setEasySolved(Integer easySolved) { this.easySolved = easySolved; }

    public Integer getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(Integer mediumSolved) { this.mediumSolved = mediumSolved; }

    public Integer getHardSolved() { return hardSolved; }
    public void setHardSolved(Integer hardSolved) { this.hardSolved = hardSolved; }

    public Double getAccuracyRate() { return accuracyRate; }
    public void setAccuracyRate(Double accuracyRate) { this.accuracyRate = accuracyRate; }

    public Double getAvgSolveMinutes() { return avgSolveMinutes; }
    public void setAvgSolveMinutes(Double avgSolveMinutes) { this.avgSolveMinutes = avgSolveMinutes; }

    public Integer getWeeklyStreak() { return weeklyStreak; }
    public void setWeeklyStreak(Integer weeklyStreak) { this.weeklyStreak = weeklyStreak; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
