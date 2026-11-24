-- PrepPulse Analytics — Placement Readiness Analytics Platform
-- MySQL 8.0 Reference Schema

CREATE DATABASE IF NOT EXISTS placement_readiness_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE placement_readiness_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(80) NOT NULL,
    batch_year INT NOT NULL,
    cgpa DOUBLE NOT NULL,
    target_tier VARCHAR(20) NOT NULL,
    leetcode_solved INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_department (department)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    category VARCHAR(30) NOT NULL,
    score DOUBLE NOT NULL,
    max_score DOUBLE NOT NULL,
    percentile DOUBLE NOT NULL,
    time_taken_minutes INT NOT NULL,
    taken_at DATE NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    CONSTRAINT fk_assessment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_assessment_user_date (user_id, taken_at),
    INDEX idx_assessment_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coding_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(80) NOT NULL,
    easy_solved INT NOT NULL DEFAULT 0,
    medium_solved INT NOT NULL DEFAULT 0,
    hard_solved INT NOT NULL DEFAULT 0,
    accuracy_rate DOUBLE NOT NULL DEFAULT 0.0,
    avg_solve_minutes DOUBLE NOT NULL DEFAULT 0.0,
    weekly_streak INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_coding_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_coding_user_topic (user_id, topic)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS skill_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    week_label VARCHAR(24) NOT NULL,
    recorded_date DATE NOT NULL,
    dsa_score DOUBLE NOT NULL,
    aptitude_score DOUBLE NOT NULL,
    core_cs_score DOUBLE NOT NULL,
    communication_score DOUBLE NOT NULL,
    readiness_index DOUBLE NOT NULL,
    CONSTRAINT fk_snapshot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_snapshot_user_date (user_id, recorded_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(40) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    rationale TEXT NOT NULL,
    action_plan TEXT NOT NULL,
    estimated_impact_points DOUBLE NOT NULL,
    resource_tag VARCHAR(80) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recommendation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_recommendation_user_priority (user_id, priority)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mentor_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    focus_area VARCHAR(80) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_feedback_student (student_id, created_at)
) ENGINE=InnoDB;
