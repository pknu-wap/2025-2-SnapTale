package com.snaptale.backend.deck.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.model.DeckPresetCreateReq;
import com.snaptale.backend.deck.model.DeckPresetRes;
import com.snaptale.backend.deck.model.DeckPresetUpdateReq;
import com.snaptale.backend.deck.service.DeckPresetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "DeckPreset API", description = "덱 프리셋 CRUD API")
@RestController
@RequestMapping("/api/deck-presets")
@RequiredArgsConstructor
@Validated
public class DeckPresetController {

    // Operation의 설명이 충분하니 따로 설명하진 않을게요!
    private final DeckPresetService deckPresetService;

    @Operation(summary = "덱 프리셋 생성", description = "덱 프리셋을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "덱 프리셋 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<DeckPresetRes> createDeckPreset(@Valid @RequestBody DeckPresetCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, deckPresetService.createDeckPreset(request));
    }

    @Operation(summary = "덱 프리셋 목록 조회", description = "덱 프리셋 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "덱 프리셋 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<DeckPresetRes>> getDeckPresets() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, deckPresetService.getDeckPresets());
    }

    @Operation(summary = "덱 프리셋 하나 조회", description = "덱 프리셋을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "덱 프리셋 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{deckPresetId}")
    public BaseResponse<DeckPresetRes> getDeckPreset(@PathVariable Long deckPresetId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, deckPresetService.getDeckPreset(deckPresetId));
    }

    @Operation(summary = "덱 프리셋 수정", description = "덱 프리셋을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "덱 프리셋 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{deckPresetId}")
    public BaseResponse<DeckPresetRes> updateDeckPreset(@PathVariable Long deckPresetId,
            @Valid @RequestBody DeckPresetUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                deckPresetService.updateDeckPreset(deckPresetId, request));
    }

    @Operation(summary = "덱 프리셋 삭제", description = "덱 프리셋을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "덱 프리셋 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{deckPresetId}")
    public BaseResponse<Void> deleteDeckPreset(@PathVariable Long deckPresetId) {
        deckPresetService.deleteDeckPreset(deckPresetId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
