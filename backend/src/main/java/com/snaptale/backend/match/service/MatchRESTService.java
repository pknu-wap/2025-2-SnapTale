package com.snaptale.backend.match.service;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.MatchType;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.entity.PlayActionType;
import com.snaptale.backend.match.model.request.MatchUpdateReq;
import com.snaptale.backend.match.model.response.MatchJoinRes;
import com.snaptale.backend.match.model.response.MatchDetailRes;
import com.snaptale.backend.match.model.response.MatchStartRes;
import com.snaptale.backend.match.model.response.PlayActionRes;
import com.snaptale.backend.match.websocket.message.PlayActionMessage;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.websocket.message.GameStateMessage;
import com.snaptale.backend.match.websocket.message.MatchJoinMessage;
import com.snaptale.backend.match.websocket.message.MatchStartMessage;
import com.snaptale.backend.user.entity.User;
import com.snaptale.backend.user.repository.UserRepository;
import com.snaptale.backend.websocket.service.WebSocketSessionManager;
import com.snaptale.backend.match.websocket.service.MatchWebSocketService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// REST API용 매치 서비스
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchRESTService {

	private final MatchRepository matchRepository;
	private final MatchParticipantRepository matchParticipantRepository;
	private final PlayRepository playRepository;
	private final UserRepository userRepository;
	private final CardRepository cardRepository;
	private final GameFlowService gameFlowService;
	private final GameCalculationService gameCalculationService;
	private final WebSocketSessionManager sessionManager;
	private final com.snaptale.backend.deck.repository.DeckPresetRepository deckPresetRepository;
	private final TurnService turnService;
	private final MatchWebSocketService matchWebSocketService;
	private final TurnTimerService turnTimerService;
	private static final int LOCATION_COUNT = 3;

	// 매치 참가자 검증
	public boolean verifyParticipant(Long matchId, Long guestId) {
		// 매치가 존재하는지 확인
		matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		// 해당 사용자가 참가자인지 확인
		return matchParticipantRepository.findByMatch_MatchIdAndGuestId(matchId, guestId)
				.isPresent();
	}

	// 매치 참가 처리
	@Transactional
	public MatchJoinRes joinMatch(MatchJoinMessage message) {
		// 게스트 ID로 QUEUED, MATCHED, PLAYING 상태의 매치에 이미 참여하고 있는지 확인
		List<MatchStatus> activeStatuses = List.of(MatchStatus.QUEUED, MatchStatus.MATCHED, MatchStatus.PLAYING);
		boolean alreadyInMatch = matchParticipantRepository.existsByGuestIdAndMatchStatusIn(
				message.getUserId(), activeStatuses);

		if (alreadyInMatch) {
			log.warn("이미 진행 중인 매치에 참여 중: userId={}", message.getUserId());
			throw new BaseException(BaseResponseStatus.ALREADY_IN_MATCH);
		}

		Match match;

		// matchId가 0이 아닌 경우: 친선전 (특정 매치 참가)
		if (message.getMatchId() != null && message.getMatchId() != 0) {
			match = matchRepository.findById(message.getMatchId())
					.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

			// 매치 타입이 FRIENDLY가 아니면 참가 불가
			if (match.getMatchType() != MatchType.FRIENDLY) {
				throw new BaseException(BaseResponseStatus.INVALID_MATCH_TYPE);
			}

			// 매치 상태가 QUEUED가 아니면 참가 불가
			if (match.getStatus() != MatchStatus.QUEUED) {
				throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
			}

			log.info("친선전 매치 참가: matchId={}, userId={}, nickname={}",
					message.getMatchId(), message.getUserId(), message.getNickname());
		} else {
			// matchId가 0인 경우: 랜덤 매치 (가장 낮은 QUEUED RANDOM 매치 선택)
			match = matchRepository
					.findFirstByStatusAndMatchTypeOrderByMatchIdAsc(MatchStatus.QUEUED,
							MatchType.RANDOM)
					.orElse(null);

			if (match == null) {
				// 없으면 새로 생성
				Match newMatch = Match.builder()
						.status(MatchStatus.QUEUED)
						.matchType(MatchType.RANDOM)
						.turnCount(0)
						.build();
				match = matchRepository.save(newMatch);

				// 다른 요청이 동시에 더 낮은 ID로 생성했을 수 있음
				Match existingMatch = matchRepository
						.findFirstByStatusAndMatchTypeOrderByMatchIdAsc(MatchStatus.QUEUED,
								MatchType.RANDOM)
						.orElse(null);

				// 다른 요청이 더 낮은 ID로 매치를 만들었다면 그것을 사용
				if (existingMatch != null && existingMatch.getMatchId() < match.getMatchId()) {
					// 새로 만든 매치 삭제하고 기존 매치 사용
					matchRepository.delete(match);
					match = existingMatch;
				}
			}

			// 이 매치로 고정
			message.setMatchId(match.getMatchId());

			log.info("랜덤 매치 참가: selectedMatchId={}, userId={}, nickname={}",
					match.getMatchId(), message.getUserId(), message.getNickname());
		}

		// 서버에서 sessionId 생성
		String sessionId = "http-session-" + System.currentTimeMillis() + "-" + Math.random();
		message.setSessionId(sessionId);

		log.info("매치 참가 처리 완료: actualMatchId={}, requestedMatchId={}, userId={}, nickname={}, sessionId={}",
				match.getMatchId(), message.getMatchId(), message.getUserId(), message.getNickname(), sessionId);

		// 세션 등록
		sessionManager.registerSession(sessionId, message.getUserId(), match.getMatchId());

		// MatchParticipant 생성 및 저장
		List<MatchParticipant> existingParticipants = matchParticipantRepository
				.findByMatch_MatchId(match.getMatchId());

		// 이미 참가했는지 확인
		boolean alreadyJoined = existingParticipants.stream()
				.anyMatch(p -> p.getGuestId().equals(message.getUserId()));

		if (!alreadyJoined) {
			// playerIndex 결정 (1부터 시작)
			int playerIndex = existingParticipants.size() + 1;

			// 선택한 덱 프리셋 적용 (없으면 첫 번째 덱 사용)
			DeckPreset deckPreset;
			if (message.getDeckPresetId() != null) {
				deckPreset = deckPresetRepository.findById(message.getDeckPresetId())
						.orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
			} else {
				deckPreset = deckPresetRepository.findAll().stream()
						.findFirst()
						.orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
			}

			// MatchParticipant 생성
			MatchParticipant participant = MatchParticipant.builder()
					.match(match)
					.guestId(message.getUserId())
					.playerIndex(playerIndex)
					.deckPreset(deckPreset)
					.finalScore(0)
					.drawIndex(0)
					.build();

			matchParticipantRepository.save(participant);
			log.info("MatchParticipant 생성 완료: matchId={}, userId={}, playerIndex={}",
					match.getMatchId(), message.getUserId(), playerIndex);
		}

		// 현재 매치 상태 반영: 2명 이상이면 MATCHED
		// MatchParticipant 수를 다시 조회하여 정확한 참가자 수 확인
		List<MatchParticipant> updatedParticipants = matchParticipantRepository
				.findByMatch_MatchId(match.getMatchId());
		int participantCount = updatedParticipants.size();

		log.info("매치 참가자 수 확인: matchId={}, participantCount={}", match.getMatchId(), participantCount);

		if (participantCount >= 2 && match.getStatus() == MatchStatus.QUEUED) {
			match = matchRepository.findById(match.getMatchId())
					.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
			match.apply(new MatchUpdateReq(
					MatchStatus.MATCHED,
					null,
					null,
					null));
			matchRepository.save(match);
			log.info("매치 상태 변경: matchId={}, QUEUED → MATCHED", match.getMatchId());
		}

		// 간단한 게임 상태 생성 (게임 시작 전)
		GameStateMessage gameState = GameStateMessage.builder()
				.matchId(match.getMatchId())
				.status(match.getStatus().name())
				.currentRound(match.getTurnCount())
				.participantScores(List.of())
				.build();

		String responseMessage = message.getNickname() + "님이 입장했습니다.";
		log.info("응답 전송: matchId={}, status={}, message={}",
				match.getMatchId(), match.getStatus(), responseMessage);
		return MatchJoinRes.success(match.getMatchId(), responseMessage, gameState);
	}

	// 매치 시작 처리
	@Transactional
	public MatchStartRes startMatch(MatchStartMessage message) {
		log.info("매치 시작 처리: matchId={}", message.getMatchId());

		// 게임 시작 로직 실행
		gameFlowService.startGame(message.getMatchId());
		turnTimerService.startTurnTimer(message.getMatchId(), 1);

		// 게임 상태 생성
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository
				.findByMatch_MatchId(message.getMatchId());

		GameStateMessage gameState = createGameStateMessage(match, participants);

		// 첫 턴 시작을 WebSocket으로 브로드캐스트 (TURN_START)
		try {
			GameCalculationService.LocationPowerResult locationPowerResult = gameCalculationService
					.calculateLocationPowers(message.getMatchId());

			TurnService.TurnEndResult initialTurnResult = TurnService.TurnEndResult.builder()
					.gameEnded(false)
					.nextTurn(Optional.ofNullable(match.getTurnCount()).orElse(1))
					.locationPowerResult(locationPowerResult)
					.build();

			matchWebSocketService.notifyTurnStart(message.getMatchId(), initialTurnResult);
		} catch (Exception e) {
			log.warn("첫 턴 시작 WebSocket 알림 중 오류 발생: matchId={}, error={}",
					message.getMatchId(), e.getMessage(), e);
		}

		return MatchStartRes.success(message.getMatchId(), "게임이 시작되었습니다!", gameState);
	}

	// 플레이 액션 처리
	@Transactional
	public PlayActionRes playAction(PlayActionMessage message) {
		log.info("플레이 액션 처리: matchId={}, participantId={}, actionType={}",
				message.getMatchId(), message.getParticipantId(), message.getActionType());

		PlayActionType actionType = message.getActionType();

		if (actionType == null) {
			throw new BaseException(BaseResponseStatus.INVALID_ACTION_TYPE);
		}

		return switch (actionType) {
			case PLAY_CARD -> handlePlayCard(message);
			case MOVE_CARD -> handleMoveCard(message); // 테스트 완
			case END_TURN -> handleEndTurn(message);
			default -> throw new BaseException(BaseResponseStatus.INVALID_ACTION_TYPE);
		};
	}

	// 카드 플레이 처리
	@Transactional
	public PlayActionRes handlePlayCard(PlayActionMessage message) {
		log.info("카드 플레이: matchId={}, participantId={}, cardId={}",
				message.getMatchId(), message.getParticipantId(), message.getCardId());

		// 슬롯 인덱스 및 카드 위치 파싱
		CardPlayData playData = parseCardPlayData(message.getAdditionalData());
		if (playData == null || playData.slotIndex == null) {
			throw new BaseException(BaseResponseStatus.INVALID_SLOT_INDEX);
		}

		// 카드 제출
		turnService.submitPlay(
				message.getMatchId(),
				message.getParticipantId(),
				message.getCardId(),
				playData.slotIndex,
				playData.cardPosition);

		// 참가자 정보 조회 (에너지 포함) - participantId는 guestId를 의미함
		MatchParticipant participant = matchParticipantRepository.findByMatch_MatchIdAndGuestId(
				message.getMatchId(), message.getParticipantId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.PARTICIPANT_NOT_FOUND));
		log.info("카드 플레이 후 참가자 조회: participantId={}, guestId={}, energy={}",
				participant.getId(), participant.getGuestId(), participant.getEnergy());

		// 카드 정보 조회 (effect 포함)
		Card card = cardRepository.findById(message.getCardId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
		String effect = card.getEffect();

		List<Integer> myLocationPowers = calculateLocationPowers(message.getMatchId(), participant.getGuestId());
		return PlayActionRes.from(message, participant, myLocationPowers, effect);
	}

	// 카드 이동 처리
	@Transactional
	public PlayActionRes handleMoveCard(PlayActionMessage message) {
		log.info("카드 이동: matchId={}, participantId={}, cardId={}",
				message.getMatchId(), message.getParticipantId(), message.getCardId());

		// 이동 데이터 파싱
		CardMoveData moveData = parseCardMoveData(message.getAdditionalData());
		if (moveData == null || moveData.fromSlotIndex == null || moveData.toSlotIndex == null) {
			throw new BaseException(BaseResponseStatus.INVALID_SLOT_INDEX);
		}

		// 카드 이동 처리 (새로운 Play 생성)
		turnService.moveCard(
				message.getMatchId(),
				message.getParticipantId(),
				message.getCardId(),
				moveData.fromSlotIndex,
				moveData.toSlotIndex,
				moveData.cardPosition);

		// 참가자 정보 조회
		MatchParticipant participant = matchParticipantRepository.findByMatch_MatchIdAndGuestId(
				message.getMatchId(), message.getParticipantId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));

		// 카드 정보 조회 (effect 포함)
		Card card = cardRepository.findById(message.getCardId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
		String effect = card.getEffect();

		// 파워 재계산 (ongoing 효과 포함) - GameCalculationService 사용
		GameCalculationService.LocationPowerResult powerResult = gameCalculationService
				.calculateLocationPowers(message.getMatchId());

		// 현재 플레이어의 파워 추출
		List<Integer> myLocationPowers = new ArrayList<>();
		Long guestId = participant.getGuestId();
		if (powerResult.getPlayer1Id().equals(guestId)) {
			for (int i = 0; i < 3; i++) {
				myLocationPowers.add(powerResult.getPlayer1Powers().getOrDefault(i, 0));
			}
		} else if (powerResult.getPlayer2Id().equals(guestId)) {
			for (int i = 0; i < 3; i++) {
				myLocationPowers.add(powerResult.getPlayer2Powers().getOrDefault(i, 0));
			}
		} else {
			// 기본값으로 0 설정
			myLocationPowers = List.of(0, 0, 0);
		}

		return PlayActionRes.from(message, participant, myLocationPowers, effect);
	}

	// 턴 종료 처리
	@Transactional
	public PlayActionRes handleEndTurn(PlayActionMessage message) {
		log.info("턴 종료 요청: matchId={}, participantId={}", message.getMatchId(), message.getParticipantId());

		// 턴 종료 제출 처리
		TurnService.TurnEndSubmitResult result = turnService.submitTurnEnd(
				message.getMatchId(), message.getParticipantId());

		log.info("턴 종료 제출 결과: matchId={}, bothPlayersEnded={}", message.getMatchId(), result.isBothPlayersEnded());

		// 양쪽 플레이어가 모두 턴 종료했으면 턴 종료 처리 후 다음 턴 시작됨.
		if (result.isBothPlayersEnded()) {
			log.info("양쪽 플레이어 모두 턴 종료 완료, processTurnEnd 호출: matchId={}", message.getMatchId());
			turnTimerService.cancelTurnTimer(message.getMatchId());
			processTurnEnd(message.getMatchId());
		} else {
			log.info("아직 상대방 턴 종료 대기 중: matchId={}", message.getMatchId());
		}

		// 참가자 정보 조회 (에너지 포함) - participantId는 guestId를 의미함
		MatchParticipant participant = matchParticipantRepository.findByMatch_MatchIdAndGuestId(
				message.getMatchId(), message.getParticipantId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.PARTICIPANT_NOT_FOUND));

		if (!result.isBothPlayersEnded()) {
			matchWebSocketService.notifyTurnEndWaiting(message.getMatchId(), participant);
		}

		log.info("턴 종료 후 참가자 조회: participantId={}, guestId={}, energy={}",
				participant.getId(), participant.getGuestId(), participant.getEnergy());

		List<Integer> myLocationPowers = calculateLocationPowers(message.getMatchId(), participant.getGuestId());

		return PlayActionRes.from(message, participant, myLocationPowers, null);
	}

	// 턴 종료 후 다음 턴 시작 로직
	@Transactional
	public void processTurnEnd(Long matchId) {
		log.info("턴 종료 처리 시작: matchId={}", matchId);

		try {
			TurnService.TurnEndResult result = turnService.endTurnAndStartNext(matchId);

			log.info("턴 종료 처리 결과: matchId={}, gameEnded={}, nextTurn={}",
					matchId, result.isGameEnded(), result.getNextTurn());

			if (result.isGameEnded()) {
				log.info("게임 종료 감지: matchId={}, currentTurn={}, processGameEnd 호출 시작",
						matchId, result.getNextTurn());
				// 마지막 턴에서도 프론트엔드가 최신 보드 상태를 받을 수 있도록
				// 기존 턴 시작 알림과 동일한 형태의 메시지를 먼저 전송
				matchWebSocketService.notifyTurnStart(matchId, result);

				matchWebSocketService.processGameEnd(matchId);
				log.info("게임 종료 처리 완료: matchId={}", matchId);
				turnTimerService.cancelTurnTimer(matchId);
			} else {
				log.info("게임 계속 진행: matchId={}, 다음 턴={}", matchId, result.getNextTurn());
				matchWebSocketService.notifyTurnStart(matchId, result);
				turnTimerService.startTurnTimer(matchId, result.getNextTurn());
			}
		} catch (Exception e) {
			log.error("턴 종료 처리 중 오류 발생: matchId={}, error={}", matchId, e.getMessage(), e);
			throw e;
		}
	}

	// additionalData에서 slotIndex와 cardPosition 파싱
	private CardPlayData parseCardPlayData(String additionalData) {
		if (additionalData == null || additionalData.isEmpty()) {
			return null;
		}

		try {
			// JSON 파싱
			// 프론트엔드에서 JSON.stringify({ slotIndex: laneIndex, cardPosition: slotIndex })로
			// 보내므로
			// "{\"slotIndex\":0,\"cardPosition\":1}" 형태로 들어옴
			JsonNode jsonNode = new ObjectMapper().readTree(additionalData);

			Integer slotIndex = Optional.ofNullable(jsonNode.get("slotIndex"))
					.filter(JsonNode::isNumber)
					.map(JsonNode::asInt)
					.orElse(null);

			Integer cardPosition = Optional.ofNullable(jsonNode.get("cardPosition"))
					.filter(JsonNode::isNumber)
					.map(JsonNode::asInt)
					.orElse(null);

			if (slotIndex == null || cardPosition == null) {
				log.warn("필수 필드 누락 - slotIndex: {}, cardPosition: {}", slotIndex, cardPosition);
				return null;
			}

			return new CardPlayData(slotIndex, cardPosition);
		} catch (Exception e) {
			log.error("카드 플레이 데이터 파싱 실패: {}", additionalData, e);
			return null;
		}
	}

	// 카드 플레이 데이터를 담는 내부 클래스
	private static class CardPlayData {
		Integer slotIndex;
		Integer cardPosition;

		CardPlayData(Integer slotIndex, Integer cardPosition) {
			this.slotIndex = slotIndex;
			this.cardPosition = cardPosition;
		}
	}

	// 카드 이동 데이터 파싱
	private CardMoveData parseCardMoveData(String additionalData) {
		if (additionalData == null || additionalData.isEmpty()) {
			return null;
		}

		try {
			JsonNode jsonNode = new ObjectMapper().readTree(additionalData);

			Integer fromSlotIndex = Optional.ofNullable(jsonNode.get("fromSlotIndex"))
					.filter(JsonNode::isNumber)
					.map(JsonNode::asInt)
					.orElse(null);

			Integer toSlotIndex = Optional.ofNullable(jsonNode.get("toSlotIndex"))
					.filter(JsonNode::isNumber)
					.map(JsonNode::asInt)
					.orElse(null);

			// 클라에서 toCardPosition으로 보냄
			Integer cardPosition = Optional.ofNullable(jsonNode.get("toCardPosition"))
					.filter(JsonNode::isNumber)
					.map(JsonNode::asInt)
					.orElse(null);

			if (fromSlotIndex == null || toSlotIndex == null) {
				log.warn("필수 필드 누락 - fromSlotIndex: {}, toSlotIndex: {}", fromSlotIndex, toSlotIndex);
				return null;
			}

			return new CardMoveData(fromSlotIndex, toSlotIndex, cardPosition);
		} catch (Exception e) {
			log.error("카드 이동 데이터 파싱 실패: {}", additionalData, e);
			return null;
		}
	}

	// 카드 이동 데이터를 담는 내부 클래스
	private static class CardMoveData {
		Integer fromSlotIndex;
		Integer toSlotIndex;
		Integer cardPosition;

		CardMoveData(Integer fromSlotIndex, Integer toSlotIndex, Integer cardPosition) {
			this.fromSlotIndex = fromSlotIndex;
			this.toSlotIndex = toSlotIndex;
			this.cardPosition = cardPosition;
		}
	}

	private List<Integer> createZeroLocationList() {
		List<Integer> zeros = new ArrayList<>(LOCATION_COUNT);
		for (int i = 0; i < LOCATION_COUNT; i++) {
			zeros.add(0);
		}
		return zeros;
	}

	private List<Integer> calculateLocationPowers(Long matchId, Long guestId) {
		if (guestId == null) {
			return createZeroLocationList();
		}
		List<Integer> powers = new ArrayList<>(LOCATION_COUNT);
		for (int slotIndex = 0; slotIndex < LOCATION_COUNT; slotIndex++) {
			Integer sum = playRepository.sumPowerSnapshotByMatchAndGuestIdAndSlotIndex(matchId, guestId, slotIndex);
			powers.add(sum != null ? sum : 0);
		}
		return powers;
	}

	// 게임 상태 메시지 생성
	private GameStateMessage createGameStateMessage(Match match, List<MatchParticipant> participants) {
		// 각 참가자의 점수 정보 생성
		List<GameStateMessage.ParticipantScore> scores = participants.stream()
				.map(p -> {
					User user = userRepository.findById(p.getGuestId()).orElse(null);
					String nickname = user != null ? user.getNickname()
							: "Player " + p.getPlayerIndex();

					// 현재까지의 총 파워 계산
					List<Play> plays = playRepository.findByMatch_MatchIdAndGuestId(
							match.getMatchId(), p.getGuestId());
					int totalPower = plays.stream()
							.mapToInt(play -> play.getPowerSnapshot() != null
									? play.getPowerSnapshot()
									: 0)
							.sum();

					return GameStateMessage.ParticipantScore.builder()
							.participantId(p.getId())
							.nickname(nickname)
							.score(totalPower)
							.remainingCards(0) // 실제 구현 시 덱에서 계산 가능
							.energy(p.getEnergy())
							.build();
				})
				.collect(Collectors.toList());

		return GameStateMessage.builder()
				.matchId(match.getMatchId())
				.status(match.getStatus().name())
				.currentRound(match.getTurnCount())
				.participantScores(scores)
				.build();
	}

	// 매치 상세 조회: 참가자 닉네임 포함
	public MatchDetailRes getMatchDetail(Long matchId) {
		Match match = matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);

		List<MatchDetailRes.ParticipantInfo> infos = participants.stream()
				.map(p -> {
					User user = userRepository.findById(p.getGuestId()).orElse(null);
					String nickname = user != null ? user.getNickname() : ("Player " + p.getPlayerIndex());
					return new MatchDetailRes.ParticipantInfo(p.getId(), p.getGuestId(), nickname, p.getEnergy());
				})
				.toList();

		return new MatchDetailRes(
				match.getMatchId(),
				match.getStatus(),
				match.getMatchType(),
				match.getWinnerId(),
				match.getTurnCount(),
				match.getEndedAt(),
				infos);
	}
}
