package com.snaptale.backend.deck.controller;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.model.DeckPresetCardCreateReq;
import com.snaptale.backend.deck.model.DeckPresetCardRes;
import com.snaptale.backend.deck.model.DeckPresetCardUpdateReq;
import com.snaptale.backend.deck.service.DeckPresetCardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "DeckPresetCard API", description = "덱 프리셋 카드 CRUD API")
@RestController
@RequestMapping("/api/deck-preset-cards")
@RequiredArgsConstructor
@Validated
public class DeckPresetCardController {

    private final DeckPresetCardService deckPresetCardService;

    @Operation(summary = "덱 프리셋 카드 생성", description = "덱 프리셋 카드를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "덱 프리셋 카드 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<DeckPresetCardRes> createDeckPresetCard(@Valid @RequestBody DeckPresetCardCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, deckPresetCardService.createDeckPresetCard(request));
    }

    @Operation(summary = "덱 프리셋 카드 조회", description = "덱 프리셋 카드를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "덱 프리셋 카드 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{deckPresetCardId}")
    public BaseResponse<CardRes> getDeckPresetCard(@PathVariable Long deckPresetCardId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                deckPresetCardService.getDeckPresetCard(deckPresetCardId));
    }

    @Operation(summary = "덱 프리셋 카드 수정", description = "덱 프리셋 카드를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "덱 프리셋 카드 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{deckPresetCardId}")
    public BaseResponse<DeckPresetCardRes> updateDeckPresetCard(@PathVariable Long deckPresetCardId,
            @Valid @RequestBody DeckPresetCardUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                deckPresetCardService.updateDeckPresetCard(deckPresetCardId, request));
    }

    @Operation(summary = "덱 프리셋 카드 삭제", description = "덱 프리셋 카드를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "덱 프리셋 카드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{deckPresetCardId}")
    public BaseResponse<Void> deleteDeckPresetCard(@PathVariable Long deckPresetCardId) {
        deckPresetCardService.deleteDeckPresetCard(deckPresetCardId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
