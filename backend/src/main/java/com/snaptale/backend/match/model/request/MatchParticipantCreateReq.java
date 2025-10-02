package com.snaptale.backend.match.model.request;

public record MatchParticipantCreateReq(
        Integer finalScore,
        Integer playerIndex,
        Long deckPresetId,
        Long matchId,
        Long guestId) {
}
