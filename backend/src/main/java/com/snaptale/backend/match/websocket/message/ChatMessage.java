package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 채팅 메시지
import java.time.LocalDateTime;

/**
 * 매치 참가자 간 채팅 메시지를 전달하기 위한 STOMP 페이로드.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private Long matchId;
    private Long userId;
    private String nickname;
    private String message;
    private String timestamp;
}
