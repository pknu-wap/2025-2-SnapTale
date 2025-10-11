package com.snaptale.backend.websocket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// WebSocket 응답 포맷
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketResponse<T> {

    // 성공 여부
    private boolean success;

    // 응답 데이터
    private T data;

    // 메시지
    private String message;

    // 타임스탬프
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // 성공 응답 생성
    public static <T> WebSocketResponse<T> success(T data) {
        return WebSocketResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    // 성공 응답 생성 (메시지 포함)
    public static <T> WebSocketResponse<T> success(T data, String message) {
        return WebSocketResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    // 에러 응답 생성
    public static <T> WebSocketResponse<T> error(String message) {
        return WebSocketResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
