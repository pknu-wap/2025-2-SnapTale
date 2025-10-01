package com.snaptale.backend.deck.model;

import com.snaptale.backend.deck.entity.DeckPresetCard;

public record DeckPresetCardRes(
        Long deckPresetCardId,
        Long cardId,
        Integer quantity) {
    public static DeckPresetCardRes from(DeckPresetCard deckPresetCard) {
        return new DeckPresetCardRes(
                deckPresetCard.getId(),
                deckPresetCard.getCard().getCardId(),
                deckPresetCard.getQuantity());
    }
}
