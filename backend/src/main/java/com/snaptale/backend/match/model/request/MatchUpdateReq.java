package com.snaptale.backend.match.model.request;

import java.time.LocalDateTime;

import com.snaptale.backend.match.entity.MatchStatus;

public record MatchUpdateReq(
        // enum에 size는 쓰면 안된다.
        MatchStatus status,
        Long winnerId,
        Integer turnCount,
        LocalDateTime endedAt) {

}
