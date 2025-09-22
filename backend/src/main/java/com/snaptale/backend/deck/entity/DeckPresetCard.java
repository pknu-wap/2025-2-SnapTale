package com.snaptale.backend.deck.entity;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
// @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deck_preset_cards")
public class DeckPresetCard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_preset_id", nullable = false)
    private DeckPreset deckPreset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "position", nullable = false)
    private Integer position;

    // Package-private method for DeckPreset to set the relationship
    void setDeckPreset(DeckPreset deckPreset) {
        this.deckPreset = deckPreset;
    }
}
