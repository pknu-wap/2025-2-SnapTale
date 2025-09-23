package com.snaptale.backend.deck.model;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeckPresetCreateReq(

        @NotBlank @Size(max = 80) String name,

        Integer active,

        LocalDateTime datetime) {
}
