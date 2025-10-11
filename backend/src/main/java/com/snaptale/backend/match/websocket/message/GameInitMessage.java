package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 게임 초기화 메시지
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameInitMessage {

    // 생성된 매치 ID
    private Long matchId;

    // 플레이어 1 ID
    private Long player1Id;

    // 플레이어 2 ID
    private Long player2Id;

    // 참가자 1 ID
    private Long participant1Id;

    // 참가자 2 ID
    private Long participant2Id;

    // 플레이어 1의 초기 핸드 카드 ID 리스트
    private List<Long> player1HandCardIds;

    // 플레이어 2의 초기 핸드 카드 ID 리스트
    private List<Long> player2HandCardIds;

    // 선택된 Location ID 리스트 (3개)
    private List<Long> locationIds;
}
