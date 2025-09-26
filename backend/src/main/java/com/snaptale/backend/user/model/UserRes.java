package com.snaptale.backend.user.model;

import java.time.LocalDateTime;

import com.snaptale.backend.user.entity.User;

public record UserRes(
        String userId,
        String nickname,
        int rankPoint,
        int matchesPlayed,
        int wins,
        LocalDateTime lastSeen) {
    public static UserRes from(User user) {
        return new UserRes(
                user.getGuestId(),
                user.getNickname(),
                user.getRankPoint(),
                user.getMatchesPlayed(),
                user.getWins(),
                user.getLastSeen());
    }
}
