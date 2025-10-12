package com.snaptale.backend.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// WebSocket 공통 메시지 포맷
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage<T> {

    // 메시지 타입 (예: JOIN, LEAVE, UPDATE, ERROR 등)
    private String type;

    // 메시지 데이터
    private T data;

    // 발신자 ID
    private Long senderId;

    // 타임스탬프
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // 메시지
    private String message;
}
