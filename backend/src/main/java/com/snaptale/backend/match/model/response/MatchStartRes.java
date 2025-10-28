package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.websocket.message.GameStateMessage;

// 매치 시작 응답
public record MatchStartRes(
        Long matchId,
        String message,
        GameStateMessage gameState) {
    public static MatchStartRes success(Long matchId, String message, GameStateMessage gameState) {
        return new MatchStartRes(matchId, message, gameState);
    }
}
