package com.snaptale.backend.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// WebSocket STOMP 설정
// - /ws-stomp: WebSocket 연결 엔드포인트
// - /topic: 구독(subscribe) 경로 prefix
// - /app: 메시지 전송(send) 경로 prefix
@Configuration("websocketConfig")
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // topic: 다수의 사용자에게 메시지 전송할 때, queue: 한 사용자에게 메시지 전송할 때
        config.enableSimpleBroker("/topic", "/queue");

        // 클라이언트에서 메시지 전송 시 기본 경로 설정
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // WebSocket 연결 기본 엔드포인트 등록
        registry.addEndpoint("/ws-stomp")
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "http://localhost:8080",
                        "https://snaptale.p-e.kr")
                .withSockJS(); // SockJS fallback 옵션
    }
}
