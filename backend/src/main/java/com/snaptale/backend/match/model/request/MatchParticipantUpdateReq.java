package com.snaptale.backend.match.model.request;

import lombok.Builder;

@Builder
public record MatchParticipantUpdateReq(
        Integer finalScore,
        Integer playerIndex,
        Long deckPresetId,
        Long matchId,
        Long guestId) {
}
