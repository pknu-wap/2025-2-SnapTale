package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.websocket.message.PlayActionMessage;

import java.util.List;

public record PlayActionRes( //todo:본인 파워 playActionMessage에 나중에 추가하기
        Long matchId,
        Long participantId,
        String actionType,
        String additionalData,
        Integer energy,
        List<Integer> myLocationPowers) {
    public static PlayActionRes from(
            PlayActionMessage message,
            MatchParticipant participant,
            List<Integer> myLocationPowers) {
        return new PlayActionRes(
                message.getMatchId(),
                message.getParticipantId(),
                message.getActionType() != null ? message.getActionType().name() : null,
                message.getAdditionalData(),
                participant != null ? participant.getEnergy() : null,
                myLocationPowers);
    }
}
