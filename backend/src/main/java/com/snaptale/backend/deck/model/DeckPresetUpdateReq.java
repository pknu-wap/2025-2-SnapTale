package com.snaptale.backend.deck.model;

import java.time.LocalDateTime;

public record DeckPresetUpdateReq(

        String name,

        Integer active,

        LocalDateTime created_at) {
}