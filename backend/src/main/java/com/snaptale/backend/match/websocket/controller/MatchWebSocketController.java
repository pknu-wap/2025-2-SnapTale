package com.snaptale.backend.match.websocket.controller;

import com.snaptale.backend.match.websocket.message.*;
import com.snaptale.backend.match.websocket.service.MatchWebSocketService;
import com.snaptale.backend.websocket.model.WebSocketResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

// Match WebSocket Controller
// 
// WebSocket 엔드포인트:
// - 연결: ws://localhost:8080/ws-stomp (SockJS: http://localhost:8080/ws-stomp)
// 
// 메시지 전송 경로:
// - /app/match/{matchId}/join: 매치 참가
// - /app/match/{matchId}/leave: 매치 퇴장
// - /app/match/{matchId}/start: 매치 시작
// - /app/match/{matchId}/play: 플레이 액션
// 
// 구독 경로:
// - /topic/match/{matchId}: 특정 매치의 모든 업데이트
// - /queue/participant/{participantId}: 특정 참가자 개인 메시지
@Slf4j
@Controller
@RequiredArgsConstructor
public class MatchWebSocketController {

    private final MatchWebSocketService matchWebSocketService;

        // 매치 퇴장
        @MessageMapping("/match/{matchId}/leave")
        @SendTo("/topic/match/{matchId}")
        public WebSocketResponse<String> leaveMatch(
                @DestinationVariable Long matchId,
                @Payload MatchLeaveMessage message) {
    
            try {
                message.setMatchId(matchId);
    
                log.info("매치 퇴장 요청: matchId={}, userId={}", matchId, message.getUserId());
    
                matchWebSocketService.handleLeave(message);
    
                return WebSocketResponse.success("퇴장했습니다.", "LEAVE_SUCCESS");
    
            } catch (Exception e) {
                log.error("매치 퇴장 실패: matchId={}, error={}", matchId, e.getMessage());
                return WebSocketResponse.error("매치 퇴장에 실패했습니다: " + e.getMessage());
            }
        }

            // 게임 상태 조회
    @MessageMapping("/match/{matchId}/state")
    @SendTo("/topic/match/{matchId}")
    public WebSocketResponse<GameStateMessage> getGameState(@DestinationVariable Long matchId) {
        try {
            log.info("게임 상태 조회 요청: matchId={}", matchId);

            GameStateMessage state = matchWebSocketService.getGameState(matchId);
            return WebSocketResponse.success(state, "게임 상태 조회 성공");

        } catch (Exception e) {
            log.error("게임 상태 조회 실패: matchId={}, error={}", matchId, e.getMessage());
            return WebSocketResponse.error("게임 상태 조회에 실패했습니다: " + e.getMessage());
        }
    }

    // 매치 채팅 메시지 처리
    @MessageMapping("/match/{matchId}/chat")
    @SendTo("/topic/match/{matchId}/chat")
    public WebSocketResponse<ChatMessage> handleChat(
            @DestinationVariable Long matchId,
            @Payload ChatMessage message) {
        try {
            message.setMatchId(matchId);
            ChatMessage chatMessage = matchWebSocketService.handleChat(message);
            return WebSocketResponse.success(chatMessage, "채팅 메시지 전송 성공");
        } catch (Exception e) {
            return WebSocketResponse.error("채팅 메시지 처리에 실패했습니다: " + e.getMessage());
        }
    }
}
