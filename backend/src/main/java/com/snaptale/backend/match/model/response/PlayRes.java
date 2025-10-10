package com.snaptale.backend.match.model.response;

import com.snaptale.backend.match.entity.Play;

//순환 참조 문제로 객체를 받는 게 아닌 id를 받는 것으로 수정.
public record PlayRes(
        Long id,
        Long matchId,
        Integer turnCount,
        Long guestId,
        Long cardId,
        Integer slotIndex,
        Integer powerSnapshot) {
    public static PlayRes from(Play play) {
        return new PlayRes(
                play.getId(),
                play.getMatch().getMatchId(),
                play.getTurnCount(),
                play.getGuestId(),
                play.getCard().getCardId(),
                play.getSlotIndex(),
                play.getPowerSnapshot());
    }
}
