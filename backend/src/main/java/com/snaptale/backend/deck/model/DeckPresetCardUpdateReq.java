package com.snaptale.backend.deck.model;

public record DeckPresetCardUpdateReq(
        Long deckPresetId,
        Long cardId,
        Integer quantity) {
}
