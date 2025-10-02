package com.snaptale.backend.match.model.request;

public record PlayCreateReq(
                Long matchId,
                Integer turnCount,
                Long guestId,
                Long cardId,
                Integer slotIndex,
                Integer powerSnapshot) {

}
