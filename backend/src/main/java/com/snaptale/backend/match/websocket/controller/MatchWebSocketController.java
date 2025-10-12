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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
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

    // 매치 참가
    //
    // 클라이언트 전송:
    // - destination: /app/match/{matchId}/join
    // - body: MatchJoinMessage
    //
    // 서버 응답:
    // - destination: /topic/match/{matchId}

    @MessageMapping("/match/{matchId}/join")
    @SendTo("/topic/match/{matchId}")
    public WebSocketResponse<String> joinMatch(
            @DestinationVariable Long matchId,
            @Payload MatchJoinMessage message,
            SimpMessageHeaderAccessor headerAccessor) {

        try {
            String sessionId = headerAccessor.getSessionId();
            message.setMatchId(matchId);
            message.setSessionId(sessionId);

            log.info("매치 참가 요청: matchId={}, userId={}, sessionId={}",
                    matchId, message.getUserId(), sessionId);

            matchWebSocketService.handleJoin(message);

            return WebSocketResponse.success(
                    message.getNickname() + "님이 입장했습니다.",
                    "JOIN_SUCCESS");

        } catch (Exception e) {
            log.error("매치 참가 실패: matchId={}, error={}", matchId, e.getMessage());
            return WebSocketResponse.error("매치 참가에 실패했습니다: " + e.getMessage());
        }
    }

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

    // 매치 시작
    @MessageMapping("/match/{matchId}/start")
    @SendTo("/topic/match/{matchId}")
    public WebSocketResponse<MatchStartMessage> startMatch(
            @DestinationVariable Long matchId,
            @Payload MatchStartMessage message) {

        try {
            message.setMatchId(matchId);

            log.info("매치 시작 요청: matchId={}", matchId);

            matchWebSocketService.handleStart(message);

            return WebSocketResponse.success(message, "게임이 시작되었습니다!");

        } catch (Exception e) {
            log.error("매치 시작 실패: matchId={}, error={}", matchId, e.getMessage());
            return WebSocketResponse.error("매치 시작에 실패했습니다: " + e.getMessage());
        }
    }

    // 플레이 액션 (카드 플레이, 턴 종료 등)
    @MessageMapping("/match/{matchId}/play")
    @SendTo("/topic/match/{matchId}")
    public WebSocketResponse<GameStateMessage> playAction(
            @DestinationVariable Long matchId,
            @Payload PlayActionMessage message) {

        try {
            message.setMatchId(matchId);

            log.info("플레이 액션 요청: matchId={}, participantId={}, actionType={}",
                    matchId, message.getParticipantId(), message.getActionType());

            matchWebSocketService.handlePlayAction(message);

            return WebSocketResponse.success(null, "액션이 처리되었습니다.");

        } catch (Exception e) {
            log.error("플레이 액션 실패: matchId={}, error={}", matchId, e.getMessage());
            return WebSocketResponse.error("액션 처리에 실패했습니다: " + e.getMessage());
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
}
