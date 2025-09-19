package com.snaptale.backend.card.model;

import jakarta.validation.constraints.Size;

public record CardUpdateReq(

        @Size(max = 80)
        String name,

        String imageUrl,

        Integer cost,

        Integer power,

        String faction,

        String effectDesc,

        Boolean active
) {}
