package com.placement.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "skill_snapshots")
public class SkillSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_label", nullable = false, length = 24)
    private String weekLabel;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(name = "dsa_score", nullable = false)
    private Double dsaScore;

    @Column(name = "aptitude_score", nullable = false)
    private Double aptitudeScore;

    @Column(name = "core_cs_score", nullable = false)
    private Double coreCsScore;

    @Column(name = "communication_score", nullable = false)
    private Double communicationScore;

    @Column(name = "readiness_index", nullable = false)
    private Double readinessIndex;

    public SkillSnapshot() {}

    public SkillSnapshot(User user, String weekLabel, LocalDate recordedDate,
                         Double dsaScore, Double aptitudeScore, Double coreCsScore,
                         Double communicationScore, Double readinessIndex) {
        this.user = user;
        this.weekLabel = weekLabel;
        this.recordedDate = recordedDate;
        this.dsaScore = dsaScore;
        this.aptitudeScore = aptitudeScore;
        this.coreCsScore = coreCsScore;
        this.communicationScore = communicationScore;
        this.readinessIndex = readinessIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getWeekLabel() { return weekLabel; }
    public void setWeekLabel(String weekLabel) { this.weekLabel = weekLabel; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public Double getDsaScore() { return dsaScore; }
    public void setDsaScore(Double dsaScore) { this.dsaScore = dsaScore; }

    public Double getAptitudeScore() { return aptitudeScore; }
    public void setAptitudeScore(Double aptitudeScore) { this.aptitudeScore = aptitudeScore; }

    public Double getCoreCsScore() { return coreCsScore; }
    public void setCoreCsScore(Double coreCsScore) { this.coreCsScore = coreCsScore; }

    public Double getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Double communicationScore) { this.communicationScore = communicationScore; }

    public Double getReadinessIndex() { return readinessIndex; }
    public void setReadinessIndex(Double readinessIndex) { this.readinessIndex = readinessIndex; }
}
