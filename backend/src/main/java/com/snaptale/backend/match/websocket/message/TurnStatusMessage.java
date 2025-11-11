package com.snaptale.backend.match.websocket.message;

import com.snaptale.backend.match.service.GameCalculationService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
}
