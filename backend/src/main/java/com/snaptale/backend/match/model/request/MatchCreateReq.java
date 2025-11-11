package com.snaptale.backend.match.model.request;

import java.time.LocalDateTime;

import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.MatchType;

import jakarta.validation.constraints.NotNull;

public record MatchCreateReq(
        @NotNull MatchStatus status,

        @NotNull MatchType matchType,

        Long winnerId,

        @NotNull Integer turnCount,

        LocalDateTime endedAt) {

}
