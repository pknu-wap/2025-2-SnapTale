package com.snaptale.backend.deck.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.deck.entity.DeckPresetCard;

public interface DeckPresetCardRepository extends JpaRepository<DeckPresetCard, Long> {
    // DeckPresetCard findByDeckPreset(Long deckPresetId);
}
