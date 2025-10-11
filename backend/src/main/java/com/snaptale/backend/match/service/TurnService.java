package com.snaptale.backend.match.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.*;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

// 턴 진행 로직을 처리하는 서비스
// - 카드 제출 처리
// - 양쪽 플레이어가 제출했는지 확인
// - 다음 턴으로 진행
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TurnService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final PlayRepository playRepository;
    private final CardRepository cardRepository;

    private static final int MAX_TURNS = 6;
    private static final int NUM_LOCATIONS = 3;

    // 카드 제출 처리
    @Transactional
    public PlaySubmissionResult submitPlay(Long matchId, Long participantId,
            Long cardId, Integer slotIndex) {
        log.info("카드 제출: matchId={}, participantId={}, cardId={}, slotIndex={}",
                matchId, participantId, cardId, slotIndex);

        // 1. 매치 및 참가자 확인
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.PLAYING) {
            throw new BaseException(BaseResponseStatus.GAME_NOT_STARTED);
        }

        MatchParticipant participant = matchParticipantRepository.findById(participantId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.PARTICIPANT_NOT_FOUND));

        // 2. 이미 이번 턴에 플레이했는지 확인
        boolean alreadyPlayed = playRepository.existsByMatchAndTurnAndPlayer(
                matchId, match.getTurnCount(), participant.getGuestId());

        if (alreadyPlayed) {
            throw new BaseException(BaseResponseStatus.ALREADY_PLAYED_THIS_TURN);
        }

        // 3. slotIndex 유효성 검증
        if (slotIndex < 0 || slotIndex >= NUM_LOCATIONS) {
            throw new BaseException(BaseResponseStatus.INVALID_SLOT_INDEX);
        }

        // 4. 카드 확인
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));

        // 5. Play 엔티티 생성 및 저장
        Play play = Play.builder()
                .match(match)
                .turnCount(match.getTurnCount())
                .guestId(participant.getGuestId())
                .card(card)
                .slotIndex(slotIndex)
                .powerSnapshot(card.getPower()) // 현재 파워 스냅샷 저장
                .build();
        playRepository.save(play);
        match.addPlay(play);

        log.info("카드 제출 완료: playId={}", play.getId());

        // 6. 양쪽 플레이어가 모두 제출했는지 확인
        List<Play> currentTurnPlays = playRepository.findByMatch_MatchIdAndTurnCount(
                matchId, match.getTurnCount());

        boolean bothPlayersSubmitted = currentTurnPlays.size() >= 2;

        return PlaySubmissionResult.builder()
                .playId(play.getId())
                .bothPlayersSubmitted(bothPlayersSubmitted)
                .currentTurn(match.getTurnCount())
                .build();
    }

    // 턴 종료 및 다음 턴 시작
    // 양쪽 플레이어가 모두 카드를 제출한 후 호출
    @Transactional
    public TurnEndResult endTurnAndStartNext(Long matchId) {
        log.info("턴 종료 및 다음 턴 시작: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.PLAYING) {
            throw new BaseException(BaseResponseStatus.GAME_NOT_STARTED);
        }

        int currentTurn = match.getTurnCount();

        // 1. 현재 턴의 플레이 확인
        List<Play> currentTurnPlays = playRepository.findByMatch_MatchIdAndTurnCount(
                matchId, currentTurn);

        if (currentTurnPlays.size() < 2) {
            throw new BaseException(BaseResponseStatus.WAITING_FOR_OTHER_PLAYER);
        }

        // 2. 마지막 턴(6턴)인지 확인
        if (currentTurn >= MAX_TURNS) {
            log.info("마지막 턴 도달, 게임 종료 처리");
            return TurnEndResult.builder()
                    .gameEnded(true)
                    .nextTurn(currentTurn)
                    .build();
        }

        // 3. 다음 턴으로 진행
        int nextTurn = currentTurn + 1;
        match.apply(new com.snaptale.backend.match.model.request.MatchUpdateReq(
                null,
                null,
                nextTurn,
                null));
        matchRepository.save(match);

        log.info("다음 턴 시작: matchId={}, turn={}", matchId, nextTurn);

        return TurnEndResult.builder()
                .gameEnded(false)
                .nextTurn(nextTurn)
                .build();
    }

    // 현재 턴의 모든 플레이어가 제출했는지 확인
    public boolean checkBothPlayersSubmitted(Long matchId, Integer turnCount) {
        List<Play> plays = playRepository.findByMatch_MatchIdAndTurnCount(matchId, turnCount);
        return plays.size() >= 2;
    }

    // Play 제출 결과 DTO
    public static class PlaySubmissionResult {
        private final Long playId;
        private final boolean bothPlayersSubmitted;
        private final int currentTurn;

        @lombok.Builder
        public PlaySubmissionResult(Long playId, boolean bothPlayersSubmitted, int currentTurn) {
            this.playId = playId;
            this.bothPlayersSubmitted = bothPlayersSubmitted;
            this.currentTurn = currentTurn;
        }

        public Long getPlayId() {
            return playId;
        }

        public boolean isBothPlayersSubmitted() {
            return bothPlayersSubmitted;
        }

        public int getCurrentTurn() {
            return currentTurn;
        }
    }

    // 턴 종료 결과 DTO
    public static class TurnEndResult {
        private final boolean gameEnded;
        private final int nextTurn;

        @lombok.Builder
        public TurnEndResult(boolean gameEnded, int nextTurn) {
            this.gameEnded = gameEnded;
            this.nextTurn = nextTurn;
        }

        public boolean isGameEnded() {
            return gameEnded;
        }

        public int getNextTurn() {
            return nextTurn;
        }
    }
}
