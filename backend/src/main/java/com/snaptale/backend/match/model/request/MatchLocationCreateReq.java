package com.snaptale.backend.match.model.request;

public record MatchLocationCreateReq(
                Long matchId,
                Integer slotIndex,
                Long locationId,
                Integer revealedTurn) {
}
