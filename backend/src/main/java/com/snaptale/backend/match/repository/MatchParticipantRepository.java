package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.match.entity.MatchParticipant;

import java.util.List;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Long> {

    // 특정 매치의 모든 참가자 조회
    List<MatchParticipant> findByMatch_MatchId(Long matchId);
}
