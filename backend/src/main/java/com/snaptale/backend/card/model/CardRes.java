package com.snaptale.backend.card.model;


import com.snaptale.backend.card.entity.Card;

public record CardRes(
        Long cardId,
        String name,
        Integer cost,
        Integer power,
        boolean active
) {
    public static CardRes from(Card card) {
        return new CardRes(
                card.getCardId(),
                card.getName(),
                card.getCost(),
                card.getPower(),
                card.isActive()
        );
    }
}
