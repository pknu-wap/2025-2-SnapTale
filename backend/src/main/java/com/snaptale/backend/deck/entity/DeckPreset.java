package com.snaptale.backend.deck.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deck_presets")
public class DeckPreset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deck_preset_id")
    private Long deckPresetId;

    @Column(name = "name", length = 80, nullable = false)
    private String name;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @Builder.Default
    @OneToMany(mappedBy = "deckPreset", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DeckPresetCard> cards = new ArrayList<>();

    public void addCard(DeckPresetCard card) {
        cards.add(card);
        card.setDeckPreset(this);
    }

    public void removeCard(DeckPresetCard card) {
        cards.remove(card);
        card.setDeckPreset(null);
    }
}

