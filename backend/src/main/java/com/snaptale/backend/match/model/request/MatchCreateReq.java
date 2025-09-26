package com.snaptale.backend.match.model.request;

import java.time.LocalDateTime;

import com.snaptale.backend.match.entity.MatchStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MatchCreateReq(
                @NotNull @Size(max = 20) MatchStatus status,

                @Size(max = 36) String winnerId,

                @NotNull Integer turnCount,

                LocalDateTime endedAt) {

}
