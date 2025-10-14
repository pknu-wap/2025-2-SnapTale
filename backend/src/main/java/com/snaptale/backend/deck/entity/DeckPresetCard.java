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

    // 연관관계 설정을 위한 메서드
    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_preset_id", nullable = false)
    private DeckPreset deckPreset;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    // 각 카드는 한 덱에 1장씩만 들어갈 수 있음 (중복 불가)
    // 따라서 quantity 필드는 제거됨

}
