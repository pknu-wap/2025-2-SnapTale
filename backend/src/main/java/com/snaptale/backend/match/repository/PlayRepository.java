package com.snaptale.backend.match.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.snaptale.backend.match.entity.Play;

import java.util.List;

public interface PlayRepository extends JpaRepository<Play, Long> {

    // 특정 매치의 특정 턴에 플레이된 모든 Play 조회
    List<Play> findByMatch_MatchIdAndTurnCount(Long matchId, Integer turnCount);

    // 특정 매치의 특정 플레이어가 플레이한 모든 Play 조회
    List<Play> findByMatch_MatchIdAndGuestId(Long matchId, Long guestId);

    // 특정 매치의 특정 턴에 특정 플레이어가 플레이했는지 확인
    @Query("SELECT COUNT(p) > 0 FROM Play p WHERE p.match.matchId = :matchId " +
            "AND p.turnCount = :turnCount AND p.guestId = :guestId")
    boolean existsByMatchAndTurnAndPlayer(@Param("matchId") Long matchId,
            @Param("turnCount") Integer turnCount,
            @Param("guestId") Long guestId);

    // 특정 매치의 모든 Play 조회
    List<Play> findByMatch_MatchId(Long matchId);

    // 특정 매치의 특정 턴에 턴 종료한 모든 Play 조회
    @Query("SELECT p FROM Play p WHERE p.match.matchId = :matchId " +
            "AND p.turnCount = :turnCount AND p.isTurnEnd = true")
    List<Play> findTurnEndsByMatchAndTurn(@Param("matchId") Long matchId,
            @Param("turnCount") Integer turnCount);

    // 특정 매치의 특정 턴에 특정 플레이어가 턴 종료했는지 확인
    @Query("SELECT COUNT(p) > 0 FROM Play p WHERE p.match.matchId = :matchId " +
            "AND p.turnCount = :turnCount AND p.guestId = :guestId AND p.isTurnEnd = true")
    boolean existsTurnEndByMatchAndTurnAndPlayer(@Param("matchId") Long matchId,
            @Param("turnCount") Integer turnCount,
            @Param("guestId") Long guestId);
}
