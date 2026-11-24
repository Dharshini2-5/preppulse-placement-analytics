package com.placement.analytics.repository;

import com.placement.analytics.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByUserIdOrderByCompletedAscCreatedAtDesc(Long userId);
    void deleteByUserIdAndCompletedFalse(Long userId);
}
