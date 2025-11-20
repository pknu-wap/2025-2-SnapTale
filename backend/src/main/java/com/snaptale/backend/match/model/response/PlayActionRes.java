package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.websocket.message.PlayActionMessage;

import java.util.List;

public record PlayActionRes(
        Long matchId,
        Long participantId,
        String actionType,
        String additionalData,
        Integer energy,
        List<Integer> myLocationPowers,
        String effect) {
    public static PlayActionRes from(
            PlayActionMessage message,
            MatchParticipant participant,
            List<Integer> myLocationPowers,
            String effect) {
        return new PlayActionRes(
                message.getMatchId(),
                message.getParticipantId(),
                message.getActionType() != null ? message.getActionType().name() : null,
                message.getAdditionalData(),
                participant != null ? participant.getEnergy() : null,
                myLocationPowers,
                effect);
    }
}
