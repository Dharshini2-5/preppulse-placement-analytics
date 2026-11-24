package com.placement.analytics.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.STUDENT;

    @Column(nullable = false, length = 80)
    private String department = "CSE";

    @Column(name = "batch_year", nullable = false)
    private Integer batchYear = 2026;

    @Column(nullable = false)
    private Double cgpa = 8.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_tier", nullable = false, length = 20)
    private TargetTier targetTier = TargetTier.PRODUCT;

    @Column(name = "leetcode_solved", nullable = false)
    private Integer leetcodeSolved = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String fullName, String email, String passwordHash, Role role, String department,
                Integer batchYear, Double cgpa, TargetTier targetTier, Integer leetcodeSolved) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.department = department;
        this.batchYear = batchYear;
        this.cgpa = cgpa;
        this.targetTier = targetTier;
        this.leetcodeSolved = leetcodeSolved;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getBatchYear() { return batchYear; }
    public void setBatchYear(Integer batchYear) { this.batchYear = batchYear; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public TargetTier getTargetTier() { return targetTier; }
    public void setTargetTier(TargetTier targetTier) { this.targetTier = targetTier; }

    public Integer getLeetcodeSolved() { return leetcodeSolved; }
    public void setLeetcodeSolved(Integer leetcodeSolved) { this.leetcodeSolved = leetcodeSolved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
