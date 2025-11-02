package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.websocket.message.PlayActionMessage;

public record PlayActionRes(
        Long matchId,
        Long participantId,
        String actionType,
        String additionalData,
        Integer energy) {
    public static PlayActionRes from(PlayActionMessage message, MatchParticipant participant) {
        return new PlayActionRes(
                message.getMatchId(),
                message.getParticipantId(),
                message.getActionType() != null ? message.getActionType().name() : null,
                message.getAdditionalData(),
                participant != null ? participant.getEnergy() : null);
    }
}
