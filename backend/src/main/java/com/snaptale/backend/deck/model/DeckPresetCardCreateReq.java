package com.snaptale.backend.deck.model;

// 한 덱에 같은 카드는 1장만 들어갈 수 있으므로 quantity 필드 제거
public record DeckPresetCardCreateReq(
                Long deckPresetId,
                Long cardId) {
}
