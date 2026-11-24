package com.placement.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 40)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    @Column(nullable = false, length = 1000)
    private String rationale;

    @Column(name = "action_plan", nullable = false, length = 1500)
    private String actionPlan;

    @Column(name = "estimated_impact_points", nullable = false)
    private Double estimatedImpactPoints;

    @Column(name = "resource_tag", nullable = false, length = 80)
    private String resourceTag;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Recommendation() {}

    public Recommendation(User user, String title, String category, Priority priority,
                          String rationale, String actionPlan, Double estimatedImpactPoints,
                          String resourceTag, Boolean completed) {
        this.user = user;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.rationale = rationale;
        this.actionPlan = actionPlan;
        this.estimatedImpactPoints = estimatedImpactPoints;
        this.resourceTag = resourceTag;
        this.completed = completed != null && completed;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }

    public String getActionPlan() { return actionPlan; }
    public void setActionPlan(String actionPlan) { this.actionPlan = actionPlan; }

    public Double getEstimatedImpactPoints() { return estimatedImpactPoints; }
    public void setEstimatedImpactPoints(Double estimatedImpactPoints) { this.estimatedImpactPoints = estimatedImpactPoints; }

    public String getResourceTag() { return resourceTag; }
    public void setResourceTag(String resourceTag) { this.resourceTag = resourceTag; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
