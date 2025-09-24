package com.snaptale.backend.match.model.response;

import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.match.entity.MatchLocation;

public record MatchLocationRes(
        Long matchLocationId,
        Long matchId,
        Integer slotIndex,
        Location location,
        Integer revealedTurn) {
    public static MatchLocationRes from(MatchLocation matchLocation) {
        return new MatchLocationRes(
                matchLocation.getId(),
                matchLocation.getMatch().getMatchId(),
                matchLocation.getSlotIndex(),
                matchLocation.getLocation(),
                matchLocation.getRevealedTurn());
    }
}
