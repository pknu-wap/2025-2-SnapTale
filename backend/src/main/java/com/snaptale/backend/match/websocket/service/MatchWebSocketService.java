package com.snaptale.backend.match.websocket.service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.service.GameCalculationService;
import com.snaptale.backend.match.websocket.message.*;
import com.snaptale.backend.user.entity.User;
import com.snaptale.backend.user.repository.UserRepository;
import com.snaptale.backend.websocket.model.WebSocketMessage;
import com.snaptale.backend.websocket.model.WebSocketResponse;
import com.snaptale.backend.websocket.service.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Match 도메인 WebSocket 비즈니스 로직 처리
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchWebSocketService {

	private final SimpMessagingTemplate messagingTemplate;
	private final MatchRepository matchRepository;
	private final MatchParticipantRepository matchParticipantRepository;
	private final PlayRepository playRepository;
	private final UserRepository userRepository;
	private final WebSocketSessionManager sessionManager;
	private final GameCalculationService gameCalculationService;

	// 매치 퇴장 처리
	@Transactional
	public void handleLeave(MatchLeaveMessage message) {
		log.info("매치 퇴장 처리: matchId={}, userId={}", message.getMatchId(), message.getUserId());

		// 세션 제거
		sessionManager.getSessionByUserId(message.getUserId())
				.ifPresent(sessionInfo -> sessionManager.removeSession(sessionInfo.sessionId()));

		broadcastToMatch(message.getMatchId(), "LEAVE", message,
				"참가자가 퇴장했습니다.");
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

	// 게임 상태 조회
	public GameStateMessage getGameState(Long matchId) {
		Match match = matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository
				.findByMatch_MatchId(matchId);

		return createGameStateMessage(match, participants);
	}

	// 특정 매치의 모든 참가자에게 메시지 브로드캐스트(Overloading)
	public void broadcastToMatch(Long matchId, String type, Object data, String message) {
		broadcastToMatch(matchId, type, data, message, null);
	}

	// 특정 매치의 모든 참가자에게 메시지 브로드캐스트 (발신자 포함)
	public void broadcastToMatch(Long matchId, String type, Object data, String message, Long senderId) {
		WebSocketMessage<?> wsMessage = WebSocketMessage.builder()
				.type(type)
				.data(data)
				.senderId(senderId)
				.message(message)
				.build();

		// /topic/match/{matchId} 구독자들에게 전송
		messagingTemplate.convertAndSend("/topic/match/" + matchId,
				WebSocketResponse.success(wsMessage));
	}

	// 특정 참가자에게만 메시지 전송
	public void sendToParticipant(Long participantId, String type, Object data, String message) {
		WebSocketMessage<?> wsMessage = WebSocketMessage.builder()
				.type(type)
				.data(data)
				.message(message)
				.build();

		// /queue/participant/{participantId} 구독자에게 전송
		messagingTemplate.convertAndSend("/queue/participant/" + participantId,
				WebSocketResponse.success(wsMessage));
	}

	// 매치 채팅 처리
	public ChatMessage handleChat(ChatMessage message) {
		if (message == null || message.getMatchId() == null) {
			throw new BaseException(BaseResponseStatus.CHAT_NOT_ALLOWED);
		}

		String trimmedContent = Optional.ofNullable(message.getContent())
				.map(String::trim)
				.orElse("");

		if (trimmedContent.isEmpty()) {
			throw new BaseException(BaseResponseStatus.INVALID_ACTION_TYPE);
		}

		// 채팅 길이 제한 (최대 500자)
		if (trimmedContent.length() > 500) {
			throw new BaseException(BaseResponseStatus.MESSAGE_TOO_LONG);
		}

		// 매치 존재 여부 및 상태 확인
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		// 채팅은 MATCHED 또는 PLAYING 상태에서만 가능
		if (match.getStatus() != MatchStatus.MATCHED && match.getStatus() != MatchStatus.PLAYING) {
			throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
		}

		// senderId 검증
		Long senderId = message.getSenderId();
		if (senderId == null) {
			throw new BaseException(BaseResponseStatus.CHAT_NOT_ALLOWED);
		}

		// 발신자가 해당 매치의 참가자인지 확인
		boolean isParticipant = matchParticipantRepository
				.findByMatch_MatchId(message.getMatchId())
				.stream()
				.anyMatch(participant -> participant.getGuestId().equals(senderId));

		if (!isParticipant) {
			throw new BaseException(BaseResponseStatus.NOT_MATCH_PARTICIPANT);
		}

		// 닉네임 조회
		String resolvedNickname = Optional.ofNullable(message.getSenderNickname())
				.filter(nick -> !nick.isBlank())
				.orElseGet(() -> userRepository.findById(senderId)
						.map(User::getNickname)
						.orElse("익명"));

		// 채팅 메시지 생성 및 반환 (브로드캐스트는 컨트롤러의 @SendTo에서 처리)
		return ChatMessage.builder()
				.matchId(message.getMatchId())
				.senderId(senderId)
				.senderNickname(resolvedNickname)
				.content(trimmedContent)
				.sentAt(LocalDateTime.now())
				.build();
	}

	// api로 대체됨.
	// @Transactional
	// public void handleJoin(MatchJoinMessage message) {
	// log.info("매치 참가 처리: matchId={}, userId={}, sessionId={}",
	// message.getMatchId(), message.getUserId(), message.getSessionId());

	// // 매치 존재 여부 확인
	// Match match = matchRepository.findById(message.getMatchId())
	// .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

	// // 세션 등록
	// sessionManager.registerSession(
	// message.getSessionId(),
	// message.getUserId(),
	// message.getMatchId());

	// // 참가자 정보 조회
	// List<MatchParticipant> participants = matchParticipantRepository
	// .findByMatch_MatchId(message.getMatchId());

	// // 게임 상태 메시지 생성 및 브로드캐스트
	// GameStateMessage gameState = createGameStateMessage(match, participants);
	// broadcastToMatch(message.getMatchId(), "JOIN", gameState,
	// message.getNickname() + "님이 입장했습니다.");
	// }

	// // api로 대체됨.
	// @Transactional
	// public void handleStart(MatchStartMessage message) {
	// log.info("매치 시작 처리: matchId={}", message.getMatchId());

	// // 게임 시작 로직 실행
	// gameFlowService.startGame(message.getMatchId());

	// // 게임 상태 브로드캐스트
	// Match match = matchRepository.findById(message.getMatchId())
	// .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
	// List<MatchParticipant> participants = matchParticipantRepository
	// .findByMatch_MatchId(message.getMatchId());

	// GameStateMessage gameState = createGameStateMessage(match, participants);
	// broadcastToMatch(message.getMatchId(), "START", gameState,
	// "게임이 시작되었습니다!");
	// }

	// 플레이 액션 처리
	// @Transactional
	// public void handlePlayAction(PlayActionMessage message) {
	// log.info("플레이 액션 처리: matchId={}, participantId={}, actionType={}",
	// message.getMatchId(), message.getParticipantId(), message.getActionType());

	// PlayActionType actionType = message.getActionType();

	// if (actionType == null) {
	// throw new BaseException(BaseResponseStatus.INVALID_ACTION_TYPE);
	// }

	// switch (actionType) {
	// case PLAY_CARD:
	// handlePlayCard(message);
	// break;
	// case END_TURN:
	// handleEndTurn(message);
	// break;
	// default:
	// throw new BaseException(BaseResponseStatus.INVALID_ACTION_TYPE);
	// }
	// }

	// 카드 플레이 처리
	// @Transactional
	// public void handlePlayCard(PlayActionMessage message) {
	// log.info("카드 플레이: matchId={}, participantId={}, cardId={}",
	// message.getMatchId(), message.getParticipantId(), message.getCardId());

	// // 슬롯 인덱스 파싱
	// Integer slotIndex = parseSlotIndex(message.getAdditionalData());
	// if (slotIndex == null) {
	// throw new BaseException(BaseResponseStatus.INVALID_SLOT_INDEX);
	// }

	// // 카드 제출
	// TurnService.PlaySubmissionResult result = turnService.submitPlay(
	// message.getMatchId(),
	// message.getParticipantId(),
	// message.getCardId(),
	// slotIndex);

	// // 매치 정보 조회
	// Match match = matchRepository.findById(message.getMatchId())
	// .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
	// List<MatchParticipant> participants = matchParticipantRepository
	// .findByMatch_MatchId(message.getMatchId());

	// // 게임 상태 업데이트
	// GameStateMessage gameState = createGameStateMessage(match, participants);
	// gameState.setLastPlayInfo("참가자 " + message.getParticipantId() + "가 카드를
	// 플레이했습니다.");

	// // 상태 브로드캐스트
	// broadcastToMatch(message.getMatchId(), "PLAY_CARD", gameState,
	// "카드가 플레이되었습니다.");

	// // 양쪽 플레이어가 모두 제출했으면 턴 종료 처리
	// if (result.isBothPlayersSubmitted()) {
	// processTurnEnd(message.getMatchId());
	// }
	// }

	// // 턴 종료 처리
	// @Transactional
	// public void handleEndTurn(PlayActionMessage message) {
	// log.info("턴 종료 요청: matchId={}", message.getMatchId());

	// // 양쪽 플레이어가 모두 제출했는지 확인
	// Match match = matchRepository.findById(message.getMatchId())
	// .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

	// boolean bothSubmitted = turnService.checkBothPlayersSubmitted(
	// message.getMatchId(), match.getTurnCount());

	// if (!bothSubmitted) {
	// throw new BaseException(BaseResponseStatus.WAITING_FOR_OTHER_PLAYER);
	// }

	// processTurnEnd(message.getMatchId());
	// }

	// 턴 종료 처리 로직
	// @Transactional
	// public void processTurnEnd(Long matchId) {
	// log.info("턴 종료 처리: matchId={}", matchId);

	// // 턴 종료 및 다음 턴 시작
	// TurnService.TurnEndResult result = turnService.endTurnAndStartNext(matchId);

	// if (result.isGameEnded()) {
	// // 게임 종료 처리
	// processGameEnd(matchId);
	// } else {
	// // 다음 턴 시작 알림
	// Match match = matchRepository.findById(matchId)
	// .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
	// List<MatchParticipant> participants = matchParticipantRepository
	// .findByMatch_MatchId(matchId);

	// GameStateMessage gameState = createGameStateMessage(match, participants);
	// broadcastToMatch(matchId, "TURN_START", gameState,
	// "턴 " + result.getNextTurn() + "이(가) 시작되었습니다.");
	// }
	// }

	// 게임 종료 처리
	@Transactional
	public void processGameEnd(Long matchId) {
		log.info("게임 종료 처리: matchId={}", matchId);

		// 승자 판정 및 통계 업데이트
		GameCalculationService.GameEndResult endResult = gameCalculationService
				.endGameAndDetermineWinner(matchId);

		// 최종 게임 상태 생성
		Match match = matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository
				.findByMatch_MatchId(matchId);

		GameStateMessage gameState = createGameStateMessage(match, participants);

		String winnerMessage;
		if (endResult.getWinnerId() != null) {
			User winner = userRepository.findById(endResult.getWinnerId())
					.orElse(null);
			String winnerNickname = winner != null ? winner.getNickname() : "Unknown";
			winnerMessage = winnerNickname + "님이 승리했습니다!";
		} else {
			winnerMessage = "무승부입니다!";
		}

		gameState.setLastPlayInfo(String.format(
				"게임 종료 - %s (Location 점령: %d vs %d, 총 파워: %d vs %d)",
				winnerMessage,
				endResult.getPlayer1LocationWins(),
				endResult.getPlayer2LocationWins(),
				endResult.getPlayer1TotalPower(),
				endResult.getPlayer2TotalPower()));

		// 게임 종료 브로드캐스트
		broadcastToMatch(matchId, "GAME_END", gameState, winnerMessage);
	}

	// additionalData에서 slotIndex 파싱
	// private Integer parseSlotIndex(String additionalData) {
	// if (additionalData == null || additionalData.isEmpty()) {
	// return null;
	// }
	// try {
	// // JSON 파싱 (간단한 경우)
	// // 예: {"slotIndex": 0}
	// String value = additionalData.replaceAll("[^0-9]", "");
	// return Integer.parseInt(value);
	// } catch (Exception e) {
	// log.error("slotIndex 파싱 실패: {}", additionalData, e);
	// return null;
	// }
	// }
}