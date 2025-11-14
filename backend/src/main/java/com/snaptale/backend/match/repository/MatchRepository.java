package com.snaptale.backend.match.repository;

import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.MatchType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Match> findFirstByStatusAndMatchTypeOrderByMatchIdAsc(MatchStatus status, MatchType matchType);
    
    // 최신 매치 조회 (match_id 내림차순)
    @Query("SELECT m FROM Match m ORDER BY m.matchId DESC")
    List<Match> findAllOrderByMatchIdDesc();
}
