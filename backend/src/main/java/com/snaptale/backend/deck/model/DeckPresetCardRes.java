package com.snaptale.backend.deck.model;

import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.deck.entity.DeckPresetCard;

public record DeckPresetCardRes(
        Long deckPresetCardId,
        CardRes card,
        Integer quantity) {
    public static DeckPresetCardRes from(DeckPresetCard deckPresetCard) {
        return new DeckPresetCardRes(
                deckPresetCard.getId(),
                CardRes.from(deckPresetCard.getCard()),
                deckPresetCard.getQuantity());
    }
}
