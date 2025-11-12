package com.snaptale.backend.match.websocket.message;

import com.snaptale.backend.match.service.GameCalculationService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TurnStatusMessage {

    private Long matchId;
    private Integer currentTurn;
    private Long endedParticipantId;
    private Long endedGuestId;
    private List<Long> waitingGuestIds;
    private boolean waitingForOpponent;
    private boolean bothPlayersEnded;
    private Integer nextTurn;
    private GameStateMessage gameState;
    private GameCalculationService.LocationPowerResult locationPowerResult;

    // 각 플레이어의 카드 배치 정보 (guestId -> 카드 배치 리스트)
    private Map<Long, List<CardPlayInfo>> playerCardPlays;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardPlayInfo {
        private Long cardId;
        private String cardName;
        private String cardImageUrl;
        private Integer slotIndex; // 어느 지역 (0, 1, 2)
        private Integer power;
        private String faction;
    }
}
