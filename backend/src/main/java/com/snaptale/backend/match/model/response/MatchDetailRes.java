package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchStatus;

import java.time.LocalDateTime;
import java.util.List;

// 매치 상세 응답: 기본 매치 정보 + 참가자 요약 정보
public record MatchDetailRes(
        Long matchId,
        MatchStatus status,
        Long winnerId,
        Integer turnCount,
        LocalDateTime endedAt,
        List<ParticipantInfo> participants) {
    public record ParticipantInfo(
            Long guestId,
            String nickname) {
    }
}
