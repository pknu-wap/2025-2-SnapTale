package com.snaptale.backend.deck.model;

public record DeckPresetCardCreateReq(
        Long deckPresetId,
        Long cardId,
        Integer quantity) {
}
