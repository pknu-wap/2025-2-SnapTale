package com.snaptale.backend.match.model.response;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.match.service.GameFlowService;
import lombok.Builder;

import java.util.List;
import java.util.stream.Collectors;

// 게임 초기화 응답
@Builder
public record GameInitRes(
        Long matchId,
        Long participant1Id,
        Long participant2Id,
        List<Long> player1HandCardIds,
        List<Long> player2HandCardIds,
        List<Long> locationIds) {
    public static GameInitRes from(GameFlowService.GameInitializationResult result) {
        return GameInitRes.builder()
                .matchId(result.getMatchId())
                .participant1Id(result.getParticipant1Id())
                .participant2Id(result.getParticipant2Id())
                .player1HandCardIds(result.getPlayer1Hand().stream()
                        .map(Card::getCardId)
                        .collect(Collectors.toList()))
                .player2HandCardIds(result.getPlayer2Hand().stream()
                        .map(Card::getCardId)
                        .collect(Collectors.toList()))
                .locationIds(result.getLocations().stream()
                        .map(Location::getLocationId)
                        .collect(Collectors.toList()))
                .build();
    }
}
