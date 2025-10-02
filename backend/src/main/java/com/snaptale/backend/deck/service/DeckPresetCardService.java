package com.snaptale.backend.deck.service;

import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.deck.entity.DeckPresetCard;
import com.snaptale.backend.deck.model.DeckPresetCardCreateReq;
import com.snaptale.backend.deck.model.DeckPresetCardRes;
import com.snaptale.backend.deck.model.DeckPresetCardUpdateReq;
import com.snaptale.backend.deck.repository.DeckPresetCardRepository;
import com.snaptale.backend.deck.repository.DeckPresetRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeckPresetCardService {

    private final DeckPresetRepository deckPresetRepository;
    private final DeckPresetCardRepository deckPresetCardRepository;
    private final CardRepository cardRepository;

    // 덱 프리셋 카드 생성
    @Transactional
    public DeckPresetCardRes createDeckPresetCard(DeckPresetCardCreateReq request) {
        // DeckPreset 조회
        DeckPreset deckPreset = deckPresetRepository.findById(request.deckPresetId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));

        // Card 조회
        Card card = cardRepository.findById(request.cardId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));

        DeckPresetCard deckPresetCard = DeckPresetCard.builder()
                .deckPreset(deckPreset)
                .card(card)
                .quantity(request.quantity())
                .build();
        deckPresetCardRepository.save(deckPresetCard);
        return DeckPresetCardRes.from(deckPresetCard);
    }

    // 덱 프리셋 카드의 카드 조회
    public CardRes getDeckPresetCard(Long deckPresetCardId) {
        return CardRes.from(deckPresetCardRepository.findById(deckPresetCardId).get().getCard());
    }

    // 덱 프리셋 카드 목록 조회
    public List<DeckPresetCardRes> getDeckPresetCards() {
        return deckPresetCardRepository.findAll().stream()
                .map(DeckPresetCardRes::from)
                .toList();
    }

    // 덱 프리셋 카드 수정
    @Transactional
    public DeckPresetCardRes updateDeckPresetCard(Long deckPresetCardId, DeckPresetCardUpdateReq request) {
        DeckPresetCard deckPresetCard = deckPresetCardRepository.findById(deckPresetCardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_CARD_NOT_FOUND));

        // DeckPreset ID가 제공되면 조회 후 설정
        if (request.deckPresetId() != null) {
            DeckPreset deckPreset = deckPresetRepository.findById(request.deckPresetId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
            deckPresetCard.setDeckPreset(deckPreset);
        }

        // Card ID가 제공되면 조회 후 설정
        if (request.cardId() != null) {
            Card card = cardRepository.findById(request.cardId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
            deckPresetCard.setCard(card);
        }

        // Quantity가 제공되면 설정
        if (request.quantity() != null) {
            deckPresetCard.setQuantity(request.quantity());
        }

        deckPresetCardRepository.save(deckPresetCard);
        return DeckPresetCardRes.from(deckPresetCard);
    }

    // 덱 프리셋 카드 삭제(뭐 삭제했는지 알려주기 위해 아이디 반환)
    @Transactional
    public Long deleteDeckPresetCard(Long deckPresetCardId) {
        DeckPresetCard deckPresetCard = deckPresetCardRepository.findById(deckPresetCardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_CARD_NOT_FOUND));
        deckPresetCardRepository.delete(deckPresetCard);
        return deckPresetCardId;
    }
}