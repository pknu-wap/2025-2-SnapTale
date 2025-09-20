package com.snaptale.backend.card.model;

import com.snaptale.backend.card.entity.Card;

import java.time.LocalDateTime;

public record CardDetailRes(
        Long cardId,
        String name,
        String imageUrl,
        Integer cost,
        Integer power,
        String faction,
        String effectDesc,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CardDetailRes from(Card card) {
        return new CardDetailRes(
                card.getCardId(),
                card.getName(),
                card.getImageUrl(),
                card.getCost(),
                card.getPower(),
                card.getFaction(),
                card.getEffectDesc(),
                card.isActive(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
