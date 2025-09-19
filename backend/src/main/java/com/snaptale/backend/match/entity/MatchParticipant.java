package com.snaptale.backend.match.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.deck.entity.DeckPreset;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "match_participants")
public class MatchParticipant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "guest_id", length = 36, nullable = false)
    private String guestId;

    @Column(name = "player_index", nullable = false)
    private Integer playerIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_preset_id", nullable = false)
    private DeckPreset deckPreset;

    @Column(name = "final_score")
    private Integer finalScore;
}
