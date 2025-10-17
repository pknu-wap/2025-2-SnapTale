package com.snaptale.backend.match.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.model.request.MatchParticipantUpdateReq;

import jakarta.persistence.*;
import lombok.*;

import java.util.Collections;
import java.util.List;

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

    @Column(name = "deck_order_json", columnDefinition = "TEXT")
    private String deckOrderJson;

    @Builder.Default
    @Column(name = "draw_index", nullable = false)
    private int drawIndex = 0;

    // 동시 수정 시 덮어쓰기 방지를 위한 필드
    @Version
    @Column(name = "version")
    private Long version;

    // deckOrderJson 필드의 직렬화/역직렬화를 위한 Jackson 객체
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final TypeReference<List<Long>> LONG_LIST_TYPE = new TypeReference<>() {
    };

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

    public List<Long> getDeckOrder() {
        if (deckOrderJson == null || deckOrderJson.isBlank()) {
            return Collections.emptyList();
        }

        try {
            return OBJECT_MAPPER.readValue(deckOrderJson, LONG_LIST_TYPE);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize deck order", e);
        }
    }

    public void setDeckOrder(List<Long> deckOrder) {
        if (deckOrder == null || deckOrder.isEmpty()) {
            this.deckOrderJson = null;
            return;
        }

        try {
            this.deckOrderJson = OBJECT_MAPPER.writeValueAsString(deckOrder);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Failed to serialize deck order", e);
        }
    }

    public void incrementDrawIndex() {
        this.drawIndex++;
    }
}
