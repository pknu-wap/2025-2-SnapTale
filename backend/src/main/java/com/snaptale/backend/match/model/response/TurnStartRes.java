package com.snaptale.backend.match.model.response;

import com.snaptale.backend.card.model.CardRes;
import com.snaptale.backend.match.service.GameFlowService;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

public record TurnStartRes(
        int turn,
        Map<Long, CardRes> drawnCards) {

    public static TurnStartRes from(GameFlowService.TurnStartResult result) {
        Map<Long, CardRes> cardMap = result.getDrawnCards().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> CardRes.from(entry.getValue()),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new));

        return new TurnStartRes(result.getTurn(), cardMap);
    }
}