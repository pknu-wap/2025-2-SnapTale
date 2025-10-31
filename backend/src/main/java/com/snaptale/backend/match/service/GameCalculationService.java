package com.snaptale.backend.match.service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.*;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.user.entity.User;
import com.snaptale.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

// 게임 계산 로직 처리 서비스
// - 각 Location별 파워 계산
// - 승자 판정
// - 사용자 통계 업데이트
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameCalculationService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final PlayRepository playRepository;
    private final UserRepository userRepository;

    private static final int NUM_LOCATIONS = 3;

    // 각 Location별 현재 파워 계산
    public LocationPowerResult calculateLocationPowers(Long matchId) {
        log.info("Location별 파워 계산: matchId={}", matchId);

        matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
        if (participants.size() != 2) {
            throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATE);
        }

        Long player1Id = participants.get(0).getGuestId();
        Long player2Id = participants.get(1).getGuestId();

        // 모든 플레이 가져오기
        List<Play> allPlays = playRepository.findByMatch_MatchId(matchId);

        // 각 Location별 파워 계산
        Map<Integer, Integer> player1Powers = new HashMap<>();
        Map<Integer, Integer> player2Powers = new HashMap<>();

        for (int slotIndex = 0; slotIndex < NUM_LOCATIONS; slotIndex++) {
            int slot = slotIndex;

            // 각 플레이어의 해당 슬롯에 놓인 카드들의 파워 합계
            int p1Power = allPlays.stream()
                    .filter(p -> p.getGuestId().equals(player1Id) && p.getSlotIndex() == slot)
                    .mapToInt(p -> p.getPowerSnapshot() != null ? p.getPowerSnapshot() : 0)
                    .sum();

            int p2Power = allPlays.stream()
                    .filter(p -> p.getGuestId().equals(player2Id) && p.getSlotIndex() == slot)
                    .mapToInt(p -> p.getPowerSnapshot() != null ? p.getPowerSnapshot() : 0)
                    .sum();

            player1Powers.put(slotIndex, p1Power);
            player2Powers.put(slotIndex, p2Power);
        }

        log.info("파워 계산 완료 - Player1: {}, Player2: {}", player1Powers, player2Powers);

        return LocationPowerResult.builder()
                .matchId(matchId)
                .player1Id(player1Id)
                .player2Id(player2Id)
                .player1Powers(player1Powers)
                .player2Powers(player2Powers)
                .build();
    }

    // 게임 종료 및 승자 판정
    @Transactional
    public GameEndResult endGameAndDetermineWinner(Long matchId) {
        log.info("게임 종료 및 승자 판정: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() == MatchStatus.ENDED) {
            throw new BaseException(BaseResponseStatus.GAME_ALREADY_ENDED);
        }

        // 1. Location별 파워 계산
        LocationPowerResult powerResult = calculateLocationPowers(matchId);

        // 2. 각 Location의 승자 판정
        int player1Wins = 0;
        int player2Wins = 0;
        int totalPlayer1Power = 0;
        int totalPlayer2Power = 0;

        for (int i = 0; i < NUM_LOCATIONS; i++) {
            int p1Power = powerResult.getPlayer1Powers().get(i);
            int p2Power = powerResult.getPlayer2Powers().get(i);

            totalPlayer1Power += p1Power;
            totalPlayer2Power += p2Power;

            if (p1Power > p2Power) {
                player1Wins++;
            } else if (p2Power > p1Power) {
                player2Wins++;
            }
            // 동점인 경우는 아무도 점령하지 않음
        }

        log.info("Location 점령 수 - Player1: {}, Player2: {}", player1Wins, player2Wins);
        log.info("총 파워 - Player1: {}, Player2: {}", totalPlayer1Power, totalPlayer2Power);

        // 3. 최종 승자 결정
        Long winnerId = null;
        if (player1Wins > player2Wins) {
            winnerId = powerResult.getPlayer1Id();
        } else if (player2Wins > player1Wins) {
            winnerId = powerResult.getPlayer2Id();
        } else {
            // Location 점령 수가 같으면 총 파워로 결정
            if (totalPlayer1Power > totalPlayer2Power) {
                winnerId = powerResult.getPlayer1Id();
            } else if (totalPlayer2Power > totalPlayer1Power) {
                winnerId = powerResult.getPlayer2Id();
            }
            // 그래도 같으면 무승부 (winnerId = null)
        }

        // 4. Match 업데이트
        match.apply(new com.snaptale.backend.match.model.request.MatchUpdateReq(
                MatchStatus.ENDED,
                winnerId,
                null,
                LocalDateTime.now()));
        matchRepository.save(match);

        // 5. MatchParticipant 최종 점수 업데이트
        List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
        for (MatchParticipant participant : participants) {
            int finalScore = participant.getGuestId().equals(powerResult.getPlayer1Id())
                    ? totalPlayer1Power
                    : totalPlayer2Power;
            participant.apply(new com.snaptale.backend.match.model.request.MatchParticipantUpdateReq(
                    finalScore,
                    null,
                    null,
                    null,
                    null), null, null);
        }

        // 6. 사용자 통계 업데이트
        updateUserStatistics(powerResult.getPlayer1Id(), powerResult.getPlayer2Id(), winnerId);

        log.info("게임 종료 완료 - 승자: {}", winnerId);

        return GameEndResult.builder()
                .matchId(matchId)
                .winnerId(winnerId)
                .player1LocationWins(player1Wins)
                .player2LocationWins(player2Wins)
                .player1TotalPower(totalPlayer1Power)
                .player2TotalPower(totalPlayer2Power)
                .build();
    }

    // 사용자 통계 업데이트
    @Transactional
    public void updateUserStatistics(Long player1Id, Long player2Id, Long winnerId) {
        log.info("사용자 통계 업데이트: player1={}, player2={}, winner={}",
                player1Id, player2Id, winnerId);

        User player1 = userRepository.findById(player1Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        User player2 = userRepository.findById(player2Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 매치 플레이 수 증가
        player1.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                null,
                null,
                player1.getMatchesPlayed() + 1,
                null,
                null,
                null));
        player2.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                null,
                null,
                player2.getMatchesPlayed() + 1,
                null,
                null,
                null));

        // 승리 수 및 랭크 포인트 업데이트
        if (winnerId != null) {
            if (winnerId.equals(player1Id)) {
                // Player 1 승리
                player1.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                        null,
                        player1.getRankPoint() + 25,
                        null,
                        player1.getWins() + 1,
                        null,
                        null));
                player2.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                        null,
                        Math.max(0, player2.getRankPoint() - 10),
                        null,
                        null,
                        null,
                        null));
            } else {
                // Player 2 승리
                player2.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                        null,
                        player2.getRankPoint() + 25,
                        null,
                        player2.getWins() + 1,
                        null,
                        null));
                player1.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                        null,
                        Math.max(0, player1.getRankPoint() - 10),
                        null,
                        null,
                        null,
                        null));
            }
        } else {
            // 무승부 - 각자 +5 포인트
            player1.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                    null,
                    player1.getRankPoint() + 5,
                    null,
                    null,
                    null,
                    null));
            player2.apply(new com.snaptale.backend.user.model.UserUpdateReq(
                    null,
                    player2.getRankPoint() + 5,
                    null,
                    null,
                    null,
                    null));
        }

        userRepository.save(player1);
        userRepository.save(player2);

        log.info("사용자 통계 업데이트 완료");
    }

    // Location별 파워 결과 DTO
    public static class LocationPowerResult {
        private final Long matchId;
        private final Long player1Id;
        private final Long player2Id;
        private final Map<Integer, Integer> player1Powers; // slotIndex -> power
        private final Map<Integer, Integer> player2Powers;

        @lombok.Builder
        public LocationPowerResult(Long matchId, Long player1Id, Long player2Id,
                Map<Integer, Integer> player1Powers,
                Map<Integer, Integer> player2Powers) {
            this.matchId = matchId;
            this.player1Id = player1Id;
            this.player2Id = player2Id;
            this.player1Powers = player1Powers;
            this.player2Powers = player2Powers;
        }

        public Long getMatchId() {
            return matchId;
        }

        public Long getPlayer1Id() {
            return player1Id;
        }

        public Long getPlayer2Id() {
            return player2Id;
        }

        public Map<Integer, Integer> getPlayer1Powers() {
            return player1Powers;
        }

        public Map<Integer, Integer> getPlayer2Powers() {
            return player2Powers;
        }
    }

    // 게임 종료 결과 DTO
    public static class GameEndResult {
        private final Long matchId;
        private final Long winnerId;
        private final int player1LocationWins;
        private final int player2LocationWins;
        private final int player1TotalPower;
        private final int player2TotalPower;

        @lombok.Builder
        public GameEndResult(Long matchId, Long winnerId, int player1LocationWins,
                int player2LocationWins, int player1TotalPower, int player2TotalPower) {
            this.matchId = matchId;
            this.winnerId = winnerId;
            this.player1LocationWins = player1LocationWins;
            this.player2LocationWins = player2LocationWins;
            this.player1TotalPower = player1TotalPower;
            this.player2TotalPower = player2TotalPower;
        }

        public Long getMatchId() {
            return matchId;
        }

        public Long getWinnerId() {
            return winnerId;
        }

        public int getPlayer1LocationWins() {
            return player1LocationWins;
        }

        public int getPlayer2LocationWins() {
            return player2LocationWins;
        }

        public int getPlayer1TotalPower() {
            return player1TotalPower;
        }

        public int getPlayer2TotalPower() {
            return player2TotalPower;
        }
    }
}
