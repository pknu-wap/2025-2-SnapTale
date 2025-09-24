package com.snaptale.backend.match.model.request;

import com.snaptale.backend.location.entity.Location;

public record MatchLocationCreateReq(
        Integer slotIndex,
        Location location,
        Integer revealedTurn) {

}
