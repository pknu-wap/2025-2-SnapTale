package com.snaptale.backend.websocket.handler;

import com.snaptale.backend.websocket.service.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Optional;

// WebSocket 연결/해제 이벤트 핸들러
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventHandler {

    private final WebSocketSessionManager sessionManager;

    // WebSocket 연결 시 호출
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        log.info("새로운 WebSocket 연결: sessionId={}", sessionId);

        // 세션 정보는 join 메시지에서 등록됨 (userId, matchId 정보 필요)
    }

    // WebSocket 연결 해제 시 호출
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        log.info("WebSocket 연결 해제: sessionId={}", sessionId);

        // 세션 정보 제거
        Optional<WebSocketSessionManager.SessionInfo> sessionInfo = sessionManager.removeSession(sessionId);

        sessionInfo.ifPresent(info -> {
            log.info("사용자 매치 퇴장 처리: userId={}, matchId={}",
                    info.userId(), info.matchId());
            // TODO: 필요시 자동으로 매치 퇴장 처리를 여기서 할 수도 있음
            // matchWebSocketService.handleAutoLeave(info);
        });
    }
}
