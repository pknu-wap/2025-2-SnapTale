package com.snaptale.backend.match.model.request;

// 게임 초기화 요청
public record GameInitReq(
        Long player1Id,
        Long player2Id,
        Long deck1Id,
        Long deck2Id) {
}
