package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 매치 시작 메시지
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchStartMessage {

    // 매치 ID
    private Long matchId;

    // 시작 시간
    @Builder.Default
    private LocalDateTime startTime = LocalDateTime.now();

    // 참가자 수
    private Integer participantCount;
    // todo: 이건 굳이..?

    // 게임 설정 정보
    private String gameSettings;
}
