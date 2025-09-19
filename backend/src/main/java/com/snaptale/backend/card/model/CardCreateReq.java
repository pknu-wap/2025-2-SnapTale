package com.snaptale.backend.card.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CardCreateReq(

        @NotBlank
        @Size(max = 80)
        String name,

        @Size(max = 255)
        String imageUrl,

        Integer cost,

        Integer power,

        String faction,

        String effectDesc,

        Boolean active
) {}

