package com.snaptale.backend.location.model;

import jakarta.validation.constraints.Size;

public record LocationUpdateReq(
                @Size(max = 80) String name,
                @Size(max = 255) String imageUrl,
                String effectDesc,
                Boolean active) {
}
