package com.snaptale.backend.match.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.*;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.service.GameCalculationService.LocationPowerResult;
import com.snaptale.backend.match.service.GameFlowService.TurnStartResult;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.*;
import java.util.Random;

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
    private final GameCalculationService gameCalculationService;
    private final GameFlowService gameFlowService;
    private static final int MAX_TURNS = 6;
    private static final int NUM_LOCATIONS = 3;

    // 카드 제출 처리
    @Transactional
    public void submitPlay(Long matchId, Long participantId,
            Long cardId, Integer slotIndex, Integer cardPosition) {
        log.info("카드 제출: matchId={}, participantId={}, cardId={}, slotIndex={}, cardPosition={}",
                matchId, participantId, cardId, slotIndex, cardPosition);

        // 1. 매치 및 참가자 확인
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
        log.info("매치 조회 성공: matchId={}", match.getMatchId());

        if (match.getStatus() != MatchStatus.PLAYING) {
            log.info("매치 상태 오류: matchId={}, status={}", match.getMatchId(), match.getStatus());
            throw new BaseException(BaseResponseStatus.GAME_NOT_STARTED);
        }

        // 참가자 조회 (participantId는 guestId를 의미함)
        MatchParticipant participant = matchParticipantRepository.findByMatch_MatchIdAndGuestId(matchId, participantId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));
        log.info("참가자 조회 성공: participantId={}, guestId={}", participant.getId(), participant.getGuestId());

        // 2. 이미 이번 턴에 턴 종료했는지 확인
        boolean alreadyEnded = playRepository.existsTurnEndByMatchAndTurnAndPlayer(
                matchId, match.getTurnCount(), participant.getGuestId());

        if (alreadyEnded) {
            log.info("이미 이번 턴을 종료한 참가자입니다: matchId={}, guestId={}, turnCount={}, play", matchId,
                    participant.getGuestId(), match.getTurnCount());
            throw new BaseException(BaseResponseStatus.ALREADY_PLAYED_THIS_TURN);
        }

        // 3. slotIndex 유효성 검증
        if (slotIndex < 0 || slotIndex >= NUM_LOCATIONS) {
            log.info("슬롯 인덱스 유효성 검증 실패: slotIndex={}", slotIndex);
            throw new BaseException(BaseResponseStatus.INVALID_SLOT_INDEX);
        }

        // 4. 카드 확인
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
        log.info("카드 조회 성공: cardId={}, name={}, cost={}", card.getCardId(), card.getName(), card.getCost());

        // 5. 카드 코스트와 에너지 소모
        Integer cardCost = card.getCost() != null ? card.getCost() : 0;

        // 에너지 소모
        participant.consumeEnergy(cardCost);
        matchParticipantRepository.save(participant);
        log.info("에너지 소모 성공: energy={}", participant.getEnergy());

        // 6. 카드 효과 적용 (on_reveal 효과 처리)
        Integer turnCount = match.getTurnCount() != null ? match.getTurnCount() : 0;
        Integer powerSnapshot = card.getPower() != null ? card.getPower() : 0;

        // on_reveal 효과 처리
        if (card.getEffect() != null && !card.getEffect().isEmpty()) {
            try {
                CardEffect effect = parseCardEffect(card.getEffect());
                if (effect != null && "on_reveal".equals(effect.getType())) {
                    powerSnapshot = applyOnRevealEffect(effect, powerSnapshot, card.getName());
                    log.info("카드 on_reveal 효과 적용: cardName={}, originalPower={}, newPower={}",
                            card.getName(), card.getPower(), powerSnapshot);
                }
            } catch (Exception e) {
                log.warn("카드 효과 파싱 실패: cardId={}, effect={}, error={}",
                        card.getCardId(), card.getEffect(), e.getMessage());
            }
        }

        Play play = Play.builder()
                .match(match)
                .turnCount(turnCount)
                .guestId(participant.getGuestId())
                .card(card)
                .slotIndex(slotIndex)
                .cardPosition(cardPosition) // 지역 내에서의 위치 (0~3)
                .powerSnapshot(powerSnapshot) // 현재 파워 스냅샷 저장
                .isTurnEnd(false) // 카드 제출
                .build();
        playRepository.save(play);
        match.addPlay(play);

        log.info("카드 제출 완료: playId={}", play.getId());
    }

    // 턴 종료 및 다음 턴 시작
    // 양쪽 플레이어가 모두 턴 종료했을 때 호출
    @Transactional
    public TurnEndResult endTurnAndStartNext(Long matchId) {
        log.info("턴 종료 및 다음 턴 시작: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.PLAYING) {
            throw new BaseException(BaseResponseStatus.GAME_NOT_STARTED);
        }

        int currentTurn = match.getTurnCount() != null ? match.getTurnCount() : 0;
        log.info("턴 종료 및 다음 턴 시작 - 현재 턴: matchId={}, currentTurn={}, MAX_TURNS={}", 
                matchId, currentTurn, MAX_TURNS);

        // 1. 현재 턴의 턴 종료 확인 (보안을 위해 재확인)
        boolean bothEnded = checkBothPlayersEnded(matchId, currentTurn);
        log.info("양쪽 플레이어 턴 종료 확인: matchId={}, currentTurn={}, bothEnded={}", 
                matchId, currentTurn, bothEnded);
        if (!bothEnded) {
            throw new BaseException(BaseResponseStatus.WAITING_FOR_OTHER_PLAYER);
        }

        // 모든 지역에서 상대, 자신의 파워 계산 후 점령 수 계산.
        LocationPowerResult locationPowerResult = gameCalculationService.calculateLocationPowers(matchId);

        // 2. 마지막 턴(6턴)인지 확인
        // 6턴이 끝났을 때 게임 종료 (currentTurn이 6이면 6턴이 끝난 것)
        if (currentTurn >= MAX_TURNS) {
            log.info("마지막 턴 도달 - 게임 종료: matchId={}, currentTurn={}, MAX_TURNS={}", 
                    matchId, currentTurn, MAX_TURNS);
            return TurnEndResult.builder()
                    .gameEnded(true)
                    .nextTurn(currentTurn)
                    .locationPowerResult(locationPowerResult)
                    .build();
        }
        
        log.info("게임 계속 진행 - 다음 턴으로: matchId={}, currentTurn={}", matchId, currentTurn);

        // 3. 다음 턴으로 진행 (에너지 지급 및 드로우 포함)
        TurnStartResult turnStartResult = gameFlowService.startNextTurn(matchId);
        int nextTurn = turnStartResult.getTurn();
        log.info("다음 턴 시작: matchId={}, turn={}", matchId, nextTurn);

        return TurnEndResult.builder()
                .gameEnded(false)
                .nextTurn(nextTurn)
                .locationPowerResult(locationPowerResult)
                .build();
    }

    // 턴 종료 처리 (플레이어가 턴 종료 버튼을 누름)
    @Transactional
    public TurnEndSubmitResult submitTurnEnd(Long matchId, Long participantId) {
        log.info("턴 종료 제출: matchId={}, participantId={}", matchId, participantId);

        // 1. 매치 및 참가자 확인
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.PLAYING) {
            throw new BaseException(BaseResponseStatus.GAME_NOT_STARTED);
        }

        // 참가자 조회 (participantId는 guestId를 의미함)
        MatchParticipant participant = matchParticipantRepository.findByMatch_MatchIdAndGuestId(matchId, participantId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));

        int currentTurn = match.getTurnCount() != null ? match.getTurnCount() : 0;

        // 2. 이미 이번 턴에 턴 종료했는지 확인
        boolean alreadyEnded = playRepository.existsTurnEndByMatchAndTurnAndPlayer(
                matchId, currentTurn, participant.getGuestId());

        if (alreadyEnded) {
            throw new BaseException(BaseResponseStatus.ALREADY_PLAYED_THIS_TURN);
        }

        // 3. Play 엔티티 생성 및 저장 (턴 종료)
        Play turnEndPlay = Play.builder()
                .match(match)
                .turnCount(currentTurn)
                .guestId(participant.getGuestId())
                .isTurnEnd(true)
                .build();
        playRepository.save(turnEndPlay);
        match.addPlay(turnEndPlay);

        log.info("턴 종료 제출 완료: turnEndPlayId={}", turnEndPlay.getId());

        // 4. 양쪽 플레이어가 모두 턴 종료했는지 확인
        List<Play> currentTurnEnds = playRepository.findTurnEndsByMatchAndTurn(
                matchId, currentTurn);

        boolean bothPlayersEnded = currentTurnEnds.size() >= 2;

        return TurnEndSubmitResult.builder()
                .turnEndId(turnEndPlay.getId())
                .bothPlayersEnded(bothPlayersEnded)
                .currentTurn(currentTurn)
                .build();
    }

    // 현재 턴의 모든 플레이어가 턴 종료했는지 확인
    public boolean checkBothPlayersEnded(Long matchId, Integer turnCount) {
        List<Play> turnEnds = playRepository.findTurnEndsByMatchAndTurn(matchId, turnCount);
        return turnEnds.size() >= 2;
    }

    // 카드 효과 파싱
    private CardEffect parseCardEffect(String effectJson) {
        if (effectJson == null || effectJson.isEmpty()) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(effectJson);

            String type = jsonNode.has("type") ? jsonNode.get("type").asText() : null;
            String action = jsonNode.has("action") ? jsonNode.get("action").asText() : null;
            String target = jsonNode.has("target") ? jsonNode.get("target").asText() : null;
            String value = jsonNode.has("value") ? jsonNode.get("value").asText() : null;
            double probability = jsonNode.has("probability") ? jsonNode.get("probability").asDouble() : 1.0;

            return new CardEffect(type, action, target, value, probability);
        } catch (Exception e) {
            log.error("카드 효과 JSON 파싱 실패: effectJson={}, error={}", effectJson, e.getMessage());
            return null;
        }
    }

    // on_reveal 효과 적용
    private Integer applyOnRevealEffect(CardEffect effect, Integer basePower, String cardName) {
        if (!"power_modify".equals(effect.getAction())) {
            log.warn("지원하지 않는 on_reveal 액션: action={}", effect.getAction());
            return basePower;
        }

        // 확률 체크
        Random random = new Random();
        if (random.nextDouble() > effect.getProbability()) {
            log.info("카드 효과 발동 실패 (확률): cardName={}, probability={}", cardName, effect.getProbability());
            return basePower;
        }

        // value 파싱 (예: "8,-6" 또는 "5")
        String valueStr = effect.getValue();
        if (valueStr == null || valueStr.isEmpty()) {
            return basePower;
        }

        try {
            // 쉼표로 구분된 값들 파싱
            String[] values = valueStr.split(",");
            if (values.length == 1) {
                // 단일 값
                int modifier = Integer.parseInt(values[0].trim());
                return basePower + modifier;
            } else if (values.length == 2) {
                // 두 개의 값 중 하나 선택 (예: +8 또는 -6)
                int value1 = Integer.parseInt(values[0].trim());
                int value2 = Integer.parseInt(values[1].trim());
                // 50% 확률로 첫 번째 값, 50% 확률로 두 번째 값
                int modifier = random.nextBoolean() ? value1 : value2;
                log.info("카드 효과 발동: cardName={}, modifier={}, basePower={}, newPower={}",
                        cardName, modifier, basePower, basePower + modifier);
                return basePower + modifier;
            }
        } catch (NumberFormatException e) {
            log.error("카드 효과 값 파싱 실패: value={}, error={}", valueStr, e.getMessage());
        }

        return basePower;
    }

    // 카드 효과를 담는 내부 클래스
    private static class CardEffect {
        private final String type;
        private final String action;
        private final String target;
        private final String value;
        private final double probability;

        public CardEffect(String type, String action, String target, String value, double probability) {
            this.type = type;
            this.action = action;
            this.target = target;
            this.value = value;
            this.probability = probability;
        }

        public String getType() {
            return type;
        }

        public String getAction() {
            return action;
        }

        public String getTarget() {
            return target;
        }

        public String getValue() {
            return value;
        }

        public double getProbability() {
            return probability;
        }
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

    // 턴 종료 제출 결과 DTO
    public static class TurnEndSubmitResult {
        private final Long turnEndId;
        private final boolean bothPlayersEnded;
        private final int currentTurn;

        @lombok.Builder
        public TurnEndSubmitResult(Long turnEndId, boolean bothPlayersEnded, int currentTurn) {
            this.turnEndId = turnEndId;
            this.bothPlayersEnded = bothPlayersEnded;
            this.currentTurn = currentTurn;
        }

        public Long getTurnEndId() {
            return turnEndId;
        }

        public boolean isBothPlayersEnded() {
            return bothPlayersEnded;
        }

        public int getCurrentTurn() {
            return currentTurn;
        }
    }

    // 턴 종료 결과 DTO
    public static class TurnEndResult {
        private final boolean gameEnded;
        private final int nextTurn;
        private final LocationPowerResult locationPowerResult;

        @lombok.Builder
        public TurnEndResult(boolean gameEnded, int nextTurn, LocationPowerResult locationPowerResult) {
            this.gameEnded = gameEnded;
            this.nextTurn = nextTurn;
            this.locationPowerResult = locationPowerResult;
        }

        public boolean isGameEnded() {
            return gameEnded;
        }

        public int getNextTurn() {
            return nextTurn;
        }

        public LocationPowerResult getLocationPowerResult() {
            return locationPowerResult;
        }
    }
}
