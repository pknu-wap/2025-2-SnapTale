package com.snaptale.backend.deck.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.snaptale.backend.deck.entity.DeckPreset;

public interface DeckPresetRepository extends JpaRepository<DeckPreset, Long> {

}
