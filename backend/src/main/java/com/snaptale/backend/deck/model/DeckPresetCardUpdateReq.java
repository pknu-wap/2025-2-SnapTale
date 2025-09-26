package com.snaptale.backend.deck.model;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.deck.entity.DeckPreset;

public record DeckPresetCardUpdateReq(
                DeckPreset deckPreset,
                Card card,
                Integer quantity) {
}
