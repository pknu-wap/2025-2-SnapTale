package com.snaptale.backend.deck.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPresetCard;
import com.snaptale.backend.deck.model.DeckPresetCardCreateReq;
import com.snaptale.backend.deck.model.DeckPresetCardRes;
import com.snaptale.backend.deck.model.DeckPresetCardUpdateReq;
import com.snaptale.backend.deck.repository.DeckPresetCardRepository;
import com.snaptale.backend.deck.repository.DeckPresetRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeckPresetCardService {

    private final DeckPresetRepository deckPresetRepository;
    private final DeckPresetCardRepository deckPresetCardRepository;

    // 덱 프리셋 카드 생성
    @Transactional
    public DeckPresetCardRes createDeckPresetCard(DeckPresetCardCreateReq request) {
        DeckPresetCard deckPresetCard = DeckPresetCard.builder()
                .deckPreset(request.deckPreset())
                .card(request.card())
                .quantity(request.quantity())
                .build();
        deckPresetRepository.save(deckPresetCard.getDeckPreset());
        deckPresetCardRepository.save(deckPresetCard);
        return DeckPresetCardRes.from(deckPresetCard);
    }

    // 덱 프리셋 카드의 카드 조회
    public CardRes getDeckPresetCard(Long deckPresetCardId) {
        return CardRes.from(deckPresetCardRepository.findById(deckPresetCardId).get().getCard());
    }

    // 덱 프리셋 카드 수정
    @Transactional
    public DeckPresetCardRes updateDeckPresetCard(Long deckPresetCardId, DeckPresetCardUpdateReq request) {
        DeckPresetCard deckPresetCard = deckPresetCardRepository.findById(deckPresetCardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_CARD_NOT_FOUND));
        deckPresetCard.apply(request);
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
