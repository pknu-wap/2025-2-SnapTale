package com.snaptale.backend.card.model;

import com.snaptale.backend.card.entity.Card;

import java.time.LocalDateTime;

public record CardRes(
        Long cardId,
        String name,
        String imageUrl,
        Integer cost,
        Integer power,
        String faction,
        String effectDesc,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
    public static CardRes from(Card card) {
        return new CardRes(
                card.getCardId(),
                card.getName(),
                card.getImageUrl(),
                card.getCost(),
                card.getPower(),
                card.getFaction(),
                card.getEffectDesc(),
                card.isActive(),
                card.getCreatedAt(),
                card.getUpdatedAt());
    }
}
