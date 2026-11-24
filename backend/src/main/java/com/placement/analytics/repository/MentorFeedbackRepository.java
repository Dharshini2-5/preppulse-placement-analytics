package com.placement.analytics.repository;

import com.placement.analytics.model.MentorFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MentorFeedbackRepository extends JpaRepository<MentorFeedback, Long> {
    List<MentorFeedback> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<MentorFeedback> findTop20ByOrderByCreatedAtDesc();
}
