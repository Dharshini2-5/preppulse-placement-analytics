package com.placement.analytics.repository;

import com.placement.analytics.model.CodingActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodingActivityRepository extends JpaRepository<CodingActivity, Long> {
    List<CodingActivity> findByUserIdOrderByTopicAsc(Long userId);
    Optional<CodingActivity> findByUserIdAndTopicIgnoreCase(Long userId, String topic);
}
