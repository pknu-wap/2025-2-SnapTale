package com.snaptale.backend.user.model;

import java.time.LocalDateTime;

public record UserCreateReq(
        String nickname,
        Integer rankPoint,
        Integer matchesPlayed,
        Integer wins,
        LocalDateTime lastSeen) {
}
