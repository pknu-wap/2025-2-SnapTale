package com.snaptale.backend.deck.model;

import java.time.LocalDateTime;

public record DeckPresetUpdateReq(
        int deck_preset_id,

        String name,

        Boolean active,

        LocalDateTime created_at) {
}