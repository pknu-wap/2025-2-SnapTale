package com.snaptale.backend.match.model.request;

import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.entity.Match;

public record MatchParticipantUpdateReq(
        Integer finalScore,
        Integer playerIndex,
        DeckPreset deckPreset,
        Match match) {
}
