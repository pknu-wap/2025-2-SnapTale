package com.snaptale.backend.deck.entity;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.deck.model.DeckPresetCardUpdateReq;

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

    // sort_order는 프엔에서 하는 거 => 삭제

    // 정보 바꿀 때
    public void apply(DeckPresetCardUpdateReq req) {
        if (req.quantity() != null) {
            this.quantity = req.quantity();
        }
    }

    // 연관관계 설정을 위한 메서드
    public void setDeckPreset(DeckPreset deckPreset) {
        this.deckPreset = deckPreset;
    }

}
