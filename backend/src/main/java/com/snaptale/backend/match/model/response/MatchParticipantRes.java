package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchParticipant;

//순환 참조 문제로 객체를 받는 게 아닌 id를 받는 것으로 수정.
public record MatchParticipantRes(
        Long matchParticipantId,
        Integer finalScore,
        Integer playerIndex,
        Long deckPresetId,
        Long matchId,
        Long guestId,
        Integer energy) {
    public static MatchParticipantRes from(MatchParticipant matchParticipant) {
        return new MatchParticipantRes(
                matchParticipant.getId(),
                matchParticipant.getFinalScore(),
                matchParticipant.getPlayerIndex(),
                matchParticipant.getDeckPreset().getDeckPresetId(),
                matchParticipant.getMatch().getMatchId(),
                matchParticipant.getGuestId(),
                matchParticipant.getEnergy());
    }
}
