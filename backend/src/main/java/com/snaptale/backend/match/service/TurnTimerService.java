package com.snaptale.backend.match.service;

import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.websocket.service.MatchWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TurnTimerService {

    private static final long TURN_TIMEOUT_SECONDS = 60L;

    private final TurnService turnService;
    private final MatchRepository matchRepository;
    private final MatchWebSocketService matchWebSocketService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final ConcurrentMap<Long, ScheduledFuture<?>> timers = new ConcurrentHashMap<>();

    public void startTurnTimer(Long matchId, int turnNumber) {
        cancelTurnTimer(matchId);
        ScheduledFuture<?> future = scheduler.schedule(
                () -> handleTimeout(matchId, turnNumber),
                TURN_TIMEOUT_SECONDS,
                TimeUnit.SECONDS);
        timers.put(matchId, future);
    }

    public void cancelTurnTimer(Long matchId) {
        Optional.ofNullable(timers.remove(matchId)).ifPresent(future -> {
            future.cancel(false);
        });
    }

    private void handleTimeout(Long matchId, int scheduledTurn) {
        timers.remove(matchId);
        try {
            Match match = matchRepository.findById(matchId).orElse(null);
            if (match == null) {
                log.warn("{} 매치를 찾을 수 없습니다.", matchId);
                return;
            }

            if (match.getStatus() != MatchStatus.PLAYING) {
                log.info("{} 매치 상태가 PLAYING 아닙니다.",
                        matchId, match.getStatus());
                return;
            }

            int currentTurn = Optional.ofNullable(match.getTurnCount()).orElse(0);
            if (currentTurn != scheduledTurn) {
                log.info("턴이 이미 진행되었습니다. matchId={}, scheduledTurn={}, currentTurn={}",
                        matchId, scheduledTurn, currentTurn);
                return;
            }

            log.info("턴 타임아웃 도달: matchId={}, turn={}", matchId, scheduledTurn);
            TurnService.TurnEndResult result = turnService.forceEndTurnDueToTimeout(matchId);

            matchWebSocketService.notifyTurnTimeout(matchId, scheduledTurn);

            if (result.isGameEnded()) {
                log.info("턴 타임아웃으로 인해 게임 종료: matchId={}", matchId);
                matchWebSocketService.processGameEnd(matchId);
            } else {
                matchWebSocketService.notifyTurnStart(matchId, result);
                // 다음 턴 타이머 스케줄링
                startTurnTimer(matchId, result.getNextTurn());
            }
        } catch (Exception e) {
            log.error("턴 타임아웃 처리 중 오류 발생: matchId={}, turn={}", matchId, scheduledTurn, e);
        }
    }

    @PreDestroy
    public void shutdownScheduler() {
        scheduler.shutdownNow();
    }

    public Duration getTurnTimeoutDuration() {
        return Duration.ofSeconds(TURN_TIMEOUT_SECONDS);
    }
}
