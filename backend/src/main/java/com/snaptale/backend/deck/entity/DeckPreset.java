package com.snaptale.backend.deck.entity;

import com.snaptale.backend.common.entity.BaseEntity;
import com.snaptale.backend.deck.model.DeckPresetUpdateReq;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
// @Setter
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
    private Integer isActive;

    // 정보 바꿀 때
    public void apply(DeckPresetUpdateReq req) {
        if (req.name() != null) {
            this.name = req.name();
        }
        if (req.active() != null) {
            this.isActive = req.active();
        }
    }
}
