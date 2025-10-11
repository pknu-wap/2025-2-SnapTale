package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 플레이 액션 메시지 (카드 플레이, 턴 종료 등)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayActionMessage {

    // 플레이 ID
    private Long playId;

    // 매치 ID
    private Long matchId;

    // 참가자 ID
    private Long participantId;

    // 카드 ID
    private Long cardId;

    // 액션 타입 (PLAY_CARD, END_TURN, SKIP 등)
    private String actionType;

    // 추가 데이터 (JSON 형태)
    private String additionalData;
}
