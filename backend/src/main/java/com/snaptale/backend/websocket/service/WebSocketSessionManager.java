package com.snaptale.backend.websocket.service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

// WebSocket 세션 관리 서비스
// - 세션 ID와 사용자/매치 정보 매핑
// - 연결 해제 시 자동 정리
@Slf4j
@Service
public class WebSocketSessionManager {

    // sessionId -> SessionInfo 매핑
    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    // userId -> sessionId 매핑 (한 사용자가 여러 세션을 가질 수 있음)
    private final Map<Long, String> userSessions = new ConcurrentHashMap<>();

    // 세션 등록
    public void registerSession(String sessionId, Long userId, Long matchId) {
        SessionInfo sessionInfo = new SessionInfo(sessionId, userId, matchId);
        sessions.put(sessionId, sessionInfo);
        userSessions.put(userId, sessionId);

        log.info("세션 등록: sessionId={}, userId={}, matchId={}", sessionId, userId, matchId);
    }

    // 세션 조회
    public Optional<SessionInfo> getSession(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    // 사용자 ID로 세션 조회
    public Optional<SessionInfo> getSessionByUserId(Long userId) {
        String sessionId = userSessions.get(userId);
        if (sessionId != null) {
            return getSession(sessionId);
        }
        return Optional.empty();
    }

    // 세션 제거
    public Optional<SessionInfo> removeSession(String sessionId) {
        SessionInfo sessionInfo = sessions.remove(sessionId);
        if (sessionInfo != null) {
            userSessions.remove(sessionInfo.userId());
            log.info("세션 제거: sessionId={}, userId={}, matchId={}",
                    sessionId, sessionInfo.userId(), sessionInfo.matchId());
        }
        return Optional.ofNullable(sessionInfo);
    }

    // 특정 매치의 모든 세션 조회
    public Map<String, SessionInfo> getSessionsByMatchId(Long matchId) {
        Map<String, SessionInfo> matchSessions = new ConcurrentHashMap<>();
        sessions.forEach((sessionId, sessionInfo) -> {
            if (sessionInfo.matchId() != null && sessionInfo.matchId().equals(matchId)) {
                matchSessions.put(sessionId, sessionInfo);
            }
        });
        return matchSessions;
    }

    // 세션 정보 클래스
        public record SessionInfo(String sessionId, Long userId, Long matchId) {}
}
