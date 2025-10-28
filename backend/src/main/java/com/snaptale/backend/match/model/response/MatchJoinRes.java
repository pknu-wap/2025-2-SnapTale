package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.websocket.message.GameStateMessage;

// 매치 참가 응답
public record MatchJoinRes(
        Long matchId,
        String message,
        GameStateMessage gameState) {
    public static MatchJoinRes success(Long matchId, String message, GameStateMessage gameState) {
        return new MatchJoinRes(matchId, message, gameState);
    }
}
