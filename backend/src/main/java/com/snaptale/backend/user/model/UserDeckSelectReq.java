package com.snaptale.backend.user.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "유저 덱 선택 요청")
public record UserDeckSelectReq(
        @Schema(description = "선택할 덱 프리셋 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long deckPresetId) {
}