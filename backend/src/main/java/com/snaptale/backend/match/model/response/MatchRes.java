package com.snaptale.backend.match.model.response;

import java.time.LocalDateTime;

import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.MatchType;
import com.snaptale.backend.match.entity.Match;

public record MatchRes(
        Long matchId,
        MatchStatus status,
        MatchType matchType,
        Long winnerId,
        Integer turnCount,
        LocalDateTime endedAt) {
    public static MatchRes from(Match match) {
        return new MatchRes(
                match.getMatchId(),
                match.getStatus(),
                match.getMatchType(),
                match.getWinnerId(),
                match.getTurnCount(),
                match.getEndedAt());
    }
}
