package com.snaptale.backend.card.controller;

import com.snaptale.backend.card.model.CardCreateReq;
import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.card.model.CardUpdateReq;
import com.snaptale.backend.card.service.CardService;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Card API", description = "카드 CRUD API")
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Validated
public class CardController {

    private final CardService cardService;

    // 테스트 완
    @Operation(summary = "모든 카드 조회", description = "모든 카드를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "카드 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<CardRes>> getCards() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.getCards());
    }

    // 테스트 완
    @Operation(summary = "특정 카드 조회", description = "특정 카드를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "카드 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{cardId}")
    public BaseResponse<CardRes> getCard(@PathVariable Long cardId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.getCard(cardId));
    }

    // 테스트 완
    @Operation(summary = "카드 생성", description = "카드를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "카드 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<CardRes> createCard(@Valid @RequestBody CardCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, cardService.createCard(request));
    }

    // 테스트 완
    @Operation(summary = "카드 수정", description = "카드를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "카드 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{cardId}")
    public BaseResponse<CardRes> updateCard(@PathVariable Long cardId,
            @Valid @RequestBody CardUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.updateCard(cardId, request));
    }

    // 테스트 완
    @Operation(summary = "카드 삭제", description = "카드를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "카드 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{cardId}")
    public BaseResponse<Void> deleteCard(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
