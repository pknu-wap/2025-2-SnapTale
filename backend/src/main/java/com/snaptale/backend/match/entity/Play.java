package com.snaptale.backend.match.entity;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.match.model.request.PlayUpdateReq;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "plays")
public class Play extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(name = "turn_count", nullable = false)
    private Integer turnCount;

    @Column(name = "guest_id", nullable = false)
    private Long guestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex;

    @Column(name = "power_snapshot")
    private Integer powerSnapshot;

    public void apply(PlayUpdateReq request) {
        if (request.turnCount() != null) {
            this.turnCount = request.turnCount();
        }
        if (request.card() != null) {
            this.card = request.card();
        }
        if (request.slotIndex() != null) {
            this.slotIndex = request.slotIndex();
        }
        if (request.powerSnapshot() != null) {
            this.powerSnapshot = request.powerSnapshot();
        }
        if (request.match() != null) {
            this.match = request.match();
        }
    }
}
