package com.snaptale.backend.deck.model;

import com.snaptale.backend.deck.entity.DeckPresetCard;

// 한 덱에 같은 카드는 1장만 들어갈 수 있으므로 quantity 필드 제거
public record DeckPresetCardRes(
        Long deckPresetCardId,
        Long cardId) {
    public static DeckPresetCardRes from(DeckPresetCard deckPresetCard) {
        return new DeckPresetCardRes(
                deckPresetCard.getId(),
                deckPresetCard.getCard().getCardId());
    }
}
