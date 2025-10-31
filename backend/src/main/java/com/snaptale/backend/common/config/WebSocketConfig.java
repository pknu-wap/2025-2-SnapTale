package com.snaptale.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // WebSocket 메시지 브로커 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket 또는 SockJS 클라이언트가 STOMP 연결을 맺을 엔드포인트를 등록합니다.
        // 이것이 바로 클라이언트가 접속할 주소입니다: /ws-stomp
        registry.addEndpoint("/ws-stomp")
                // WebConfig에 명시된 Origin 패턴들을 그대로 적용합니다.
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "https://snaptale.p-e.kr",
                        "https://www.snaptale.p-e.kr",
                        "https://snap-tale.netlify.app"
                );
                // .withSockJS(); // SockJS를 사용하려면 이 주석을 해제하세요.
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 메시지 브로커가 처리할 토픽(prefix)을 설정합니다. (구독용)
        // 클라이언트는 /topic/..., /queue/... 등을 구독(subscribe)합니다.
        registry.enableSimpleBroker("/topic", "/queue");

        // 클라이언트가 서버로 메시지를 보낼 때(publish) 사용할 prefix를 설정합니다. (발행용)
        // 이전에 보여주신 코드의 /app/room/{roomId}/join 경로와 일치합니다.
        // @MessageMapping 어노테이션이 붙은 컨트롤러 메소드로 라우팅됩니다.
        registry.setApplicationDestinationPrefixes("/app");
    }
}