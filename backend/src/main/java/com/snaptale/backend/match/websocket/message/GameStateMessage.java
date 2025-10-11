package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 게임 상태 업데이트 메시지
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateMessage {

    // 매치 ID
    private Long matchId;

    // 현재 턴 참가자 ID
    private Long currentTurnParticipantId;

    // 게임 상태 (WAITING, IN_PROGRESS, FINISHED)
    private String status;

    // 현재 라운드
    private Integer currentRound;

    // 참가자 점수 정보
    private List<ParticipantScore> participantScores;

    // 마지막 플레이 정보
    private String lastPlayInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantScore {
        private Long participantId;
        private String nickname;
        private Integer score;
        private Integer remainingCards;
    }
}
