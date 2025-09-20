package com.snaptale.backend.card.controller;

import com.snaptale.backend.card.model.CardCreateReq;
import com.snaptale.backend.card.model.CardDetailRes;
import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.card.model.CardUpdateReq;
import com.snaptale.backend.card.service.CardService;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Card API", description = "카드 CRUD API")
@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @GetMapping
    public BaseResponse<List<CardRes>> getCards() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.getCards());
    }

    @GetMapping("/{cardId}")
    public BaseResponse<CardDetailRes> getCard(@PathVariable Long cardId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.getCard(cardId));
    }

    @PostMapping
    public BaseResponse<CardDetailRes> createCard(@Valid @RequestBody CardCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, cardService.createCard(request));
    }

    @PatchMapping("/{cardId}")
    public BaseResponse<CardDetailRes> updateCard(@PathVariable Long cardId, @Valid @RequestBody CardUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, cardService.updateCard(cardId, request));
    }

    @DeleteMapping("/{cardId}")
    public BaseResponse<Void> deleteCard(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
