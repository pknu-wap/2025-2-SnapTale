package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 매치 참가 메시지
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchJoinMessage {

    // 매치 ID
    private Long matchId;

    // 참가자 ID
    private Long userId;

    // 참가자 닉네임
    private String nickname;

    // 세션 ID (서버에서 생성)
    private String sessionId;
}
