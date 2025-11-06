package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.MatchParticipant;

import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

    // 특정 매치의 모든 참가자 조회
    List<MatchParticipant> findByMatch_MatchId(Long matchId);

    // 특정 매치와 게스트 ID로 참가자 조회
    Optional<MatchParticipant> findByMatch_MatchIdAndGuestId(Long matchId, Long guestId);
}
