package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 매치 퇴장 메시지
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchLeaveMessage {

    // 매치 ID
    private Long matchId;

    // 참가자 ID
    private Long userId;

    // 퇴장 사유
    private String reason;
    // todo: 이건 굳이..?
}
