package com.snaptale.backend.match.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.model.request.MatchParticipantUpdateReq;

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

    @Column(name = "guest_id", nullable = false)
    private Long guestId;

    @Column(name = "player_index", nullable = false)
    private Integer playerIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_preset_id", nullable = false)
    private DeckPreset deckPreset;

    @Column(name = "final_score")
    private Integer finalScore;

    public void apply(MatchParticipantUpdateReq request, Match match, DeckPreset deckPreset) {
        if (request.finalScore() != null) {
            this.finalScore = request.finalScore();
        }
        if (request.playerIndex() != null) {
            this.playerIndex = request.playerIndex();
        }
        if (request.guestId() != null) {
            this.guestId = request.guestId();
        }
        if (request.deckPresetId() != null && deckPreset != null) {
            this.deckPreset = deckPreset;
        }
        if (request.matchId() != null && match != null) {
            this.match = match;
        }
    }
}
