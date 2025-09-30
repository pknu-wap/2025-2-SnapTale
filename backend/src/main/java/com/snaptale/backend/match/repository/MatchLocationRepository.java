package com.snaptale.backend.match.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snaptale.backend.match.entity.MatchLocation;

@Repository
public interface MatchLocationRepository extends JpaRepository<MatchLocation, Long> {
        // 나중에 쿼리 dsl로 변경 지금은 그냥 그대로 사용
        @Query("SELECT ml FROM MatchLocation ml " +
                        "JOIN FETCH ml.match m " +
                        "JOIN FETCH ml.location l " +
                        "WHERE ml.id = :id")
        Optional<MatchLocation> findByIdWithFetch(@Param("id") Long id);

        @Query("SELECT ml FROM MatchLocation ml " +
                        "JOIN FETCH ml.match m " +
                        "JOIN FETCH ml.location l")
        List<MatchLocation> findAllWithFetch();
}
