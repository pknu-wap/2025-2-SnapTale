package com.snaptale.backend.match.model.request;

public record PlayUpdateReq(
                Integer turnCount,
                Long guestId,
                Long cardId,
                Integer slotIndex,
                Integer powerSnapshot,
                Long matchId) {
}
