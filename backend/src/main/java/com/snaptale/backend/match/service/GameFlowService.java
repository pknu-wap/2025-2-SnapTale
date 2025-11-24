package com.snaptale.backend.match.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.deck.entity.DeckPresetCard;
import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.match.entity.*;
import com.snaptale.backend.match.model.request.MatchUpdateReq;
import com.snaptale.backend.match.repository.MatchLocationRepository;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

// 게임 전체 플로우를 관리하는 서비스
// - 게임 초기화 (매칭, 덱 초기화, 카드 드로우)
// - 턴 진행 (카드 제출, 파워 계산)
// - 게임 종료 (승자 판정, 사용자 통계 업데이트)
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameFlowService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final MatchLocationRepository matchLocationRepository;
    private final MatchLocationService matchLocationService;
    private static final int INITIAL_ENERGY = 100;
    private static final int ENERGY_PER_TURN = 1;

    // 게임 시작 (턴 카운트를 1로 설정하고 상태를 PLAYING으로 변경)
    @Transactional
    public void startGame(Long matchId) {
        log.info("게임 시작: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.MATCHED) {
            throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
        }

        // 매치에 지역이 할당되지 않았다면 랜덤으로 3개 할당
        List<MatchLocation> existingLocations = matchLocationRepository.findByMatchIdWithFetch(matchId);
        if (existingLocations.isEmpty()) {
            log.info("매치에 지역 할당: matchId={}", matchId);
            matchLocationService.assignRandomLocationsToMatch(matchId);
        }

        match.apply(new MatchUpdateReq(
                MatchStatus.PLAYING,
                null,
                1,
                null));
        matchRepository.save(match);

        // 모든 플레이어에게 초기 에너지 부여
        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
        // matchParticipant의 id임. guestId는 아님.
        for (MatchParticipant participant : participants) {
            log.info("초기 에너지 설정 전: participantId={}, guestId={}, energy={}",
                    participant.getId(), participant.getGuestId(), participant.getEnergy());
            participant.addEnergy(INITIAL_ENERGY);
            matchParticipantRepository.save(participant);
            // 저장 후 다시 조회하여 확인
            MatchParticipant saved = matchParticipantRepository.findById(participant.getId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));
            log.info("초기 에너지 설정 후: participantId={}, guestId={}, energy={}",
                    saved.getId(), saved.getGuestId(), saved.getEnergy());
        }

        // 첫 턴 시작 드로우 수행
        Map<Long, Card> firstTurnDrawn = performTurnDraw(match);
        log.info("게임 시작 완료: matchId={}, turnCount={}, firstTurnDrawnParticipants={}, initialEnergy={}",
                matchId, match.getTurnCount(), firstTurnDrawn.keySet(), INITIAL_ENERGY);
    }

    @Transactional
    public TurnStartResult startNextTurn(Long matchId) {
        log.info("다음 턴 시작: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.PLAYING) {
            throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
        }

        // 턴을 먼저 증가시키고
        int currentTurnCount = Optional.ofNullable(match.getTurnCount()).orElse(0);
        int nextTurn = currentTurnCount + 1;
        match.apply(new MatchUpdateReq(null, null, nextTurn, null));
        matchRepository.save(match);

        // 모든 플레이어에게 턴마다 에너지 추가 및 다음 턴 에너지 보너스 적용
        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
        for (MatchParticipant participant : participants) {
            // 기본 에너지 추가
            MatchParticipant updatedParticipant = participant.addEnergy(ENERGY_PER_TURN);
            // 다음 턴 에너지 보너스 적용
            updatedParticipant.applyNextTurnEnergyBonus();
            matchParticipantRepository.save(updatedParticipant);
        }

        // 이번 턴 드로우 수행
        Map<Long, Card> drawnCards = performTurnDraw(match);
        log.info("턴 시작 완료: matchId={}, turn={}, drawnParticipants={}, addedEnergy={}",
                matchId, nextTurn, drawnCards.keySet(), ENERGY_PER_TURN);

        return new TurnStartResult(nextTurn, drawnCards);
    }

    public static class TurnStartResult {
        private final int turn;
        private final Map<Long, Card> drawnCards;

        public TurnStartResult(int turn, Map<Long, Card> drawnCards) {
            this.turn = turn;
            this.drawnCards = Collections.unmodifiableMap(new LinkedHashMap<>(drawnCards));
        }

        public int getTurn() {
            return turn;
        }

        public Map<Long, Card> getDrawnCards() {
            return drawnCards;
        }
    }

    // 특정 덱(DeckPreset) 안에서 주어진 카드 ID(cardId)에 해당하는 Card 객체를 찾음
    private Card resolveCardFromDeck(DeckPreset deck, Long cardId) {
        return deck.getDeckPresetcards().stream()
                .map(DeckPresetCard::getCard)
                .filter(card -> card.getCardId().equals(cardId))
                .findFirst()
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
    }

    private Optional<Card> drawCardFromDeck(MatchParticipant participant) {
        List<Long> deckOrder = participant.getDeckOrder();
        if (deckOrder.isEmpty()) {
            return Optional.empty();
        }

        int drawIndex = participant.getDrawIndex();
        if (drawIndex >= deckOrder.size()) {
            return Optional.empty();
        }

        Long cardId = deckOrder.get(drawIndex);
        Card card = resolveCardFromDeck(participant.getDeckPreset(), cardId);
        participant.incrementDrawIndex();
        matchParticipantRepository.save(participant);
        return Optional.of(card);
    }

    // 플레이어의 카드 드로우
    private Map<Long, Card> performTurnDraw(Match match) {
        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(match.getMatchId());
        Map<Long, Card> drawn = new LinkedHashMap<>();
        for (MatchParticipant participant : participants) {
            drawCardFromDeck(participant).ifPresent(card -> drawn.put(participant.getId(), card));
        }
        return drawn;
    }

    // 게임 초기화 결과 DTO
    public static class GameInitializationResult {
        private final Long matchId;
        private final Long participant1Id;
        private final Long participant2Id;
        private final List<Card> player1Hand;
        private final List<Card> player2Hand;
        private final List<Location> locations;

        @lombok.Builder
        public GameInitializationResult(Long matchId, Long participant1Id, Long participant2Id,
                List<Card> player1Hand, List<Card> player2Hand,
                List<Location> locations) {
            this.matchId = matchId;
            this.participant1Id = participant1Id;
            this.participant2Id = participant2Id;
            this.player1Hand = player1Hand;
            this.player2Hand = player2Hand;
            this.locations = locations;
        }

        public Long getMatchId() {
            return matchId;
        }

        public Long getParticipant1Id() {
            return participant1Id;
        }

        public Long getParticipant2Id() {
            return participant2Id;
        }

        public List<Card> getPlayer1Hand() {
            return player1Hand;
        }

        public List<Card> getPlayer2Hand() {
            return player2Hand;
        }

        public List<Location> getLocations() {
            return locations;
        }
    }
}
