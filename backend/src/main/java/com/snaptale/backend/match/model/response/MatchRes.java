package com.snaptale.backend.match.model.response;

import java.time.LocalDateTime;

import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.Match;

public record MatchRes(
        Long matchId,
        MatchStatus status,
        String winnerId,
        Integer turnCount,
        LocalDateTime endedAt) {
    public static MatchRes from(Match match) {
        return new MatchRes(
                match.getMatchId(),
                match.getStatus(),
                match.getWinnerId(),
                match.getTurnCount(),
                match.getEndedAt());
    }
}
