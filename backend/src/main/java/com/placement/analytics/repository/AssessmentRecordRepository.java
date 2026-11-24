package com.placement.analytics.repository;

import com.placement.analytics.model.AssessmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRecordRepository extends JpaRepository<AssessmentRecord, Long> {
    List<AssessmentRecord> findByUserIdOrderByTakenAtDescIdDesc(Long userId);
    List<AssessmentRecord> findByUserIdOrderByTakenAtAscIdAsc(Long userId);
}
