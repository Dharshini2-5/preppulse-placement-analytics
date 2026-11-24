package com.placement.analytics.repository;

import com.placement.analytics.model.SkillSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillSnapshotRepository extends JpaRepository<SkillSnapshot, Long> {
    List<SkillSnapshot> findByUserIdOrderByRecordedDateAscIdAsc(Long userId);
}
