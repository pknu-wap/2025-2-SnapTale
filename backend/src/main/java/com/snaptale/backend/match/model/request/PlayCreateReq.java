package com.snaptale.backend.match.model.request;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.match.entity.Match;

public record PlayCreateReq(
        Match match,
        Integer turnCount,
        Card card,
        Integer slotIndex,
        Integer powerSnapshot) {

}
