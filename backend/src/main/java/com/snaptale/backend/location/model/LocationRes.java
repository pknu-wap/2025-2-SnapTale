package com.snaptale.backend.location.model;

import com.snaptale.backend.location.entity.Location;

public record LocationRes(
        Long locationId,
        String name,
        String imageUrl,
        String effectDesc,
        boolean active) {
    public static LocationRes from(Location location) {
        return new LocationRes(
                location.getLocationId(),
                location.getName(),
                location.getImageUrl(),
                location.getEffectDesc(),
                location.isActive());
    }
}
