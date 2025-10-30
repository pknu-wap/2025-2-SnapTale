
package com.snaptale.backend.match.websocket.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 매치 참가자 간 채팅 메시지를 전달하기 위한 STOMP 페이로드.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    /** 매치 식별자 */
    private Long matchId;

    /** 발신자 사용자 ID (게스트 ID) */
    private Long senderId;

    /** 발신자 닉네임 */
    private String senderNickname;

    /** 전송한 채팅 본문 */
    private String content;

    /** 서버에서 지정한 전송 시각 */
    private LocalDateTime sentAt;
}