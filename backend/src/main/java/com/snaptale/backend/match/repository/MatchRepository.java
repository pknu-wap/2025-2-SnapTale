package com.snaptale.backend.match.repository;

import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Match> findFirstByStatusOrderByMatchIdAsc(MatchStatus status);
}
