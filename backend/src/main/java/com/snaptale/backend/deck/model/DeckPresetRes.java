package com.snaptale.backend.deck.model;

import java.time.LocalDateTime;
import java.util.List;

import com.snaptale.backend.deck.entity.DeckPreset;

public record DeckPresetRes(
        Long deckPresetId,
        String name,
        Integer active,
        LocalDateTime createdAt,
        List<DeckPresetCardRes> cards) {
    public static DeckPresetRes from(DeckPreset deckPreset) {
        return new DeckPresetRes(
                deckPreset.getDeckPresetId(),
                deckPreset.getName(),
                deckPreset.getIsActive(),
                deckPreset.getCreatedAt(),
                deckPreset.getDeckPresetcards().stream()
                        .map(DeckPresetCardRes::from)
                        .toList());
    }
}
