package com.snaptale.backend.card.service;

import com.snaptale.backend.card.model.CardCreateReq;
import com.snaptale.backend.card.model.CardDetailRes;
import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.card.model.CardUpdateReq;

import java.util.List;

public interface CardService {

    /**
     * 모든 카드를 조회 (관리자용 목록)
     */
    List<CardRes> getCards();

    /**
     * 특정 카드의 상세 정보를 조회
     */
    CardDetailRes getCard(Long cardId);

    /**
     * 새로운 카드를 등록
     */
    CardDetailRes createCard(CardCreateReq request);

    /**
     * 카드의 메타데이터(코스트/파워 등)를 수정
     */
    CardDetailRes updateCard(Long cardId, CardUpdateReq request);

    /**
     * 카드를 삭제
     */
    void deleteCard(Long cardId);
}
