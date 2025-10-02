package com.snaptale.backend.card.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.model.CardCreateReq;
import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.card.model.CardUpdateReq;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 참고: CardService를 인터페이스로 설계하고 실제 구현은 CardServiceImpl에서 하는 방식을 고려했었는데
 * 그냥 CardService에 비즈니스 로직을 바로 포함하는 방식으로 설계해주세요
 * 다른 Service도 마찬가지입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회 성능을 위한
public class CardService {

    private final CardRepository cardRepository;

    /**
     * 모든 카드를 조회 (관리자용 목록)
     */
    public List<CardRes> getCards() {
        List<Card> cards = cardRepository.findAll();
        if (cards.isEmpty()) {
            throw new BaseException(BaseResponseStatus.CARD_NOT_FOUND);
        }
        return cards.stream()
                .map(CardRes::from)
                .toList();
    }

    /**
     * 특정 카드 조회
     */
    public CardRes getCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
        return CardRes.from(card);
    };

    /**
     * 새로운 카드를 등록
     */
    @Transactional
    public CardRes createCard(CardCreateReq request) {
        Card card = Card.builder()
                .name(request.name())
                .imageUrl(request.imageUrl())
                .cost(request.cost())
                .power(request.power())
                .faction(request.faction())
                .effectDesc(request.effectDesc())
                .isActive(request.active() != null ? request.active() : true) // 기본값 true
                .build();
        cardRepository.save(card);
        return CardRes.from(card);
    };

    /**
     * 카드의 메타데이터(코스트/파워 등)를 수정
     */
    @Transactional
    public CardRes updateCard(Long cardId, CardUpdateReq request) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
        card.apply(request);
        cardRepository.save(card);
        return CardRes.from(card);
    };

    /**
     * 카드를 삭제(뭐 삭제했는지 알려주기 위해 아이디 반환)
     */
    @Transactional
    public Long deleteCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
        cardRepository.delete(card);
        return cardId;
    };
}
