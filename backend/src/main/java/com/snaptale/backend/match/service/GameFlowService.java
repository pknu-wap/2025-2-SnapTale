package com.snaptale.backend.match.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.deck.entity.DeckPresetCard;
import com.snaptale.backend.deck.repository.DeckPresetRepository;
import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.location.repository.LocationRepository;
import com.snaptale.backend.match.entity.*;
import com.snaptale.backend.match.repository.MatchLocationRepository;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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
    private final PlayRepository playRepository;
    private final UserRepository userRepository;
    private final DeckPresetRepository deckPresetRepository;
    private final LocationRepository locationRepository;
    private static final int NUM_LOCATIONS = 3;
    private static final int INITIAL_HAND_SIZE = 3;
    private static final Set<String> ALLOWED_DECK_FACTIONS =
            Set.of("한국", "중국", "일본");

    // 게임 초기화
    // - Match 생성
    // - 두 플레이어의 MatchParticipant 생성
    // - 3개의 Location 할당
    // - 각 플레이어의 덱에서 초기 카드 드로우 (각 3장)
    //
    // 중요: 같은 덱을 두 플레이어가 사용하면 안 됨 (카드 중복 방지)
    // 사용 가능한 덱: 1~6번 한국/중국/일본 단일 진영 덱
    @Transactional
    public GameInitializationResult initializeGame(Long player1Id, Long player2Id,
            Long deck1Id, Long deck2Id) {
        log.info("게임 초기화 시작: player1={}, player2={}, deck1={}, deck2={}",
                player1Id, player2Id, deck1Id, deck2Id);

        // 1. 유저 존재 확인
        userRepository.findById(player1Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        userRepository.findById(player2Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        // 2. 덱 존재 확인 및 검증
        DeckPreset deck1 = deckPresetRepository.findById(deck1Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_NOT_FOUND));
        DeckPreset deck2 = deckPresetRepository.findById(deck2Id)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_NOT_FOUND));

        // 덱 중복 사용 방지
        if (deck1Id.equals(deck2Id)) {
            throw new BaseException(BaseResponseStatus.DUPLICATE_DECK_USAGE);
        }

        // 덱 카드 수 및 진영 검증
        validateDeckSize(deck1);
        validateDeckSize(deck2);

        // 3. Match 생성
        Match match = Match.builder()
                .status(MatchStatus.MATCHED)
                .turnCount(0)
                .build();
        matchRepository.save(match);

        // 4. MatchParticipant 생성
        MatchParticipant participant1 = MatchParticipant.builder()
                .match(match)
                .guestId(player1Id)
                .playerIndex(0)
                .deckPreset(deck1)
                .build();
        matchParticipantRepository.save(participant1);
        match.addParticipant(participant1);

        MatchParticipant participant2 = MatchParticipant.builder()
                .match(match)
                .guestId(player2Id)
                .playerIndex(1)
                .deckPreset(deck2)
                .build();
        matchParticipantRepository.save(participant2);
        match.addParticipant(participant2);

        // 5. Location 할당 (랜덤으로 3개 선택)
        List<Location> allLocations = locationRepository.findAll();
        if (allLocations.size() < NUM_LOCATIONS) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_LOCATIONS);
        }

        Collections.shuffle(allLocations);
        List<Location> selectedLocations = allLocations.subList(0, NUM_LOCATIONS);

        for (int i = 0; i < NUM_LOCATIONS; i++) {
            MatchLocation matchLocation = MatchLocation.builder()
                    .match(match)
                    .slotIndex(i)
                    .location(selectedLocations.get(i))
                    .revealedTurn(1) // 첫 턴부터 공개
                    .build();
            matchLocationRepository.save(matchLocation);
            match.addLocation(matchLocation);
        }

        // 6. 각 플레이어의 초기 핸드 드로우  (3장)
        List<Card> player1Hand = drawInitialHand(deck1);
        List<Card> player2Hand = drawInitialHand(deck2);

        log.info("게임 초기화 완료: matchId={}", match.getMatchId());

        return GameInitializationResult.builder()
                .matchId(match.getMatchId())
                .participant1Id(participant1.getId())
                .participant2Id(participant2.getId())
                .player1Hand(player1Hand)
                .player2Hand(player2Hand)
                .locations(selectedLocations)
                .build();
    }

    // 덱 카드 수 검증 (12장인지 확인)
    private void validateDeckSize(DeckPreset deck) {
        int totalCards = deck.getDeckPresetcards().size();

        if (totalCards != 12) {
            throw new BaseException(BaseResponseStatus.INVALID_DECK_SIZE);
        }
    }

    // 덱에서 초기 카드 드로우
    // 각 덱은 정확히 12장으로 구성되어 있으며, 단일 진영 카드만 포함됨
    // 초기 핸드는 3장으로 제한되며, 이후 턴마다 1장씩 드로우한다
    private List<Card> drawInitialHand(DeckPreset deck) {
        List<Card> allCards = deck.getDeckPresetcards().stream()
                .map(DeckPresetCard::getCard)
                .collect(Collectors.toList());

        Collections.shuffle(allCards);
        int handSize = Math.min(INITIAL_HAND_SIZE, allCards.size());
        return new ArrayList<>(allCards.subList(0, handSize));
    }

    // --------------------------------------------------------------------------------------------------------

    // 게임 시작 (턴 카운트를 1로 설정하고 상태를 PLAYING으로 변경)
    @Transactional
    public void startGame(Long matchId) {
        log.info("게임 시작: matchId={}", matchId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        if (match.getStatus() != MatchStatus.MATCHED) {
            throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
        }

        match.apply(new com.snaptale.backend.match.model.request.MatchUpdateReq(
                MatchStatus.PLAYING,
                null,
                1,
                null));

        matchRepository.save(match);
        log.info("게임 시작 완료: matchId={}, turnCount={}", matchId, match.getTurnCount());
    }

    // 다음 카드 드로우 (턴 시작 시)
    // 참고: 플레이어는 초기 3장을 받은 뒤, 매 턴마다 이 메서드를 통해 1장을 드로우한다고 가정
    public Card drawNextCard(Long matchId, Long participantId, int currentTurn) {
        MatchParticipant participant = matchParticipantRepository.findById(participantId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.PARTICIPANT_NOT_FOUND));

        DeckPreset deck = participant.getDeckPreset();

        // 덱의 모든 카드 리스트 생성 (각 카드는 1장씩만 있음)
        List<Card> allCards = deck.getDeckPresetcards().stream()
                .map(DeckPresetCard::getCard)
                .collect(Collectors.toList());

        // 이미 플레이한 카드 제외
        List<Play> playedCards = playRepository.findByMatch_MatchIdAndGuestId(
                matchId, participant.getGuestId());
        Set<Long> playedCardIds = playedCards.stream()
                .map(play -> play.getCard().getCardId())
                .collect(Collectors.toSet());

        List<Card> remainingCards = allCards.stream()
                .filter(card -> !playedCardIds.contains(card.getCardId()))
                .collect(Collectors.toList());

        if (remainingCards.isEmpty()) {
            return null; // 더 이상 드로우할 카드 없음
        }

        // 랜덤으로 1장 선택
        Collections.shuffle(remainingCards);
        return remainingCards.get(0);
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
