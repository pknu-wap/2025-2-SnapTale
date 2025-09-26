package com.snaptale.backend.user.model;

import java.time.LocalDateTime;

public record UserCreateReq(
        String nickname,
        int rankPoint,
        int matchesPlayed,
        int wins,
        LocalDateTime lastSeen) {

}
