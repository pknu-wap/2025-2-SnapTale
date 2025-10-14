package com.snaptale.backend.deck.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.deck.entity.DeckPresetCard;

import java.util.List;

public interface DeckPresetCardRepository extends JpaRepository<DeckPresetCard, Long> {
    // 특정 덱(deck_preset_id)에 속한 카드 목록 조회
    List<DeckPresetCard> findByDeckPresetDeckPresetId(Long deckPresetId);
}
