package com.snaptale.backend.match.model.request;

public record MatchParticipantUpdateReq(
        Integer finalScore,
        Integer playerIndex,
        Long deckPresetId,
        Long matchId,
        Long guestId) {
}
