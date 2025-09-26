package com.snaptale.backend.match.model.response;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.Play;

public record PlayRes(
        Long id,
        Match match,
        Integer turnCount,
        Card card,
        Integer slotIndex,
        Integer powerSnapshot) {
    public static PlayRes from(Play play) {
        return new PlayRes(
                play.getId(),
                play.getMatch(),
                play.getTurnCount(),
                play.getCard(),
                play.getSlotIndex(),
                play.getPowerSnapshot());
    }
}
