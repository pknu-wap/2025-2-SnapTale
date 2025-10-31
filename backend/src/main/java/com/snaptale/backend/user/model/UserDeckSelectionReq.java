package com.snaptale.backend.user.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UserDeckSelectionReq(
        @NotNull
        @Schema(description = "선택할 덱 프리셋 ID", example = "1")
        Long deckPresetId) {
}