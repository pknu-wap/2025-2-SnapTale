package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.MatchLocation;

public record MatchLocationRes(
        Long matchLocationId,
        Long matchId,
        Integer slotIndex,
        LocationInfo location,
        Integer revealedTurn) {

    public record LocationInfo(
            Long locationId,
            String name,
            String imageUrl,
            String effectDesc,
            Boolean isActive) {
    }

    public static MatchLocationRes from(MatchLocation matchLocation) {
        return new MatchLocationRes(
                matchLocation.getId(),
                matchLocation.getMatch().getMatchId(),
                matchLocation.getSlotIndex(),
                new LocationInfo(
                        matchLocation.getLocation().getLocationId(),
                        matchLocation.getLocation().getName(),
                        matchLocation.getLocation().getImageUrl(),
                        matchLocation.getLocation().getEffectDesc(),
                        matchLocation.getLocation().getIsActive()),
                matchLocation.getRevealedTurn());
    }
}
