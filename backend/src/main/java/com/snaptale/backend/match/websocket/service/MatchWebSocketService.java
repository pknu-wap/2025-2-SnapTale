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
import com.snaptale.backend.match.service.TurnService;
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

import com.snaptale.backend.match.model.request.MatchUpdateReq;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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

		// 매치 조회 및 상태 확인
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		// 매치 상태가 QUEUED, MATCHED, PLAYING 중 하나면 ENDED로 변경
		if (match.getStatus() != MatchStatus.ENDED) {
			log.info("매치 상태를 ENDED로 변경: matchId={}, 기존 상태={}", message.getMatchId(), match.getStatus());

			// 중도 퇴장 시 남은 플레이어를 승자로 설정
			Long winnerId = null;
			List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(message.getMatchId());

			// 퇴장한 사람이 아닌 다른 참가자를 찾아서 승자로 설정
			Optional<MatchParticipant> remainingParticipant = participants.stream()
					.filter(p -> !p.getGuestId().equals(message.getUserId()))
					.findFirst();

			// 퇴장한 사람의 닉네임 조회
			User leaver = userRepository.findById(message.getUserId()).orElse(null);
			String leaverNickname = leaver != null ? leaver.getNickname() : "상대방";

			if (remainingParticipant.isPresent()) {
				winnerId = remainingParticipant.get().getGuestId();
				log.info("중도 퇴장으로 인한 승자 설정: matchId={}, winnerId={}, leaverId={}",
						message.getMatchId(), winnerId, message.getUserId());

				// 매치 상태 업데이트
				match.apply(new MatchUpdateReq(
						MatchStatus.ENDED,
						winnerId, // 남은 플레이어를 승자로 설정
						null,
						LocalDateTime.now()));
				matchRepository.save(match);

				// 업데이트된 매치 정보 다시 조회
				match = matchRepository.findById(message.getMatchId())
						.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

				// 게임 종료 메시지 생성 및 브로드캐스트
				GameStateMessage gameState = createGameStateMessage(match, participants);
				String winnerMessage = leaverNickname + "님이 나갔습니다. 당신이 승자입니다!";
				gameState.setLastPlayInfo(winnerMessage);

				// 게임 종료 브로드캐스트
				broadcastToMatch(message.getMatchId(), "GAME_END", gameState, winnerMessage);
			} else {
				log.warn("남은 참가자가 없음: matchId={}, leaverId={}", message.getMatchId(), message.getUserId());

				// 승자가 없어도 게임 종료 처리
				match.apply(new MatchUpdateReq(
						MatchStatus.ENDED,
						null,
						null,
						LocalDateTime.now()));
				matchRepository.save(match);

				// 업데이트된 매치 정보 다시 조회
				match = matchRepository.findById(message.getMatchId())
						.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

				// 게임 종료 메시지 생성 및 브로드캐스트
				GameStateMessage gameState = createGameStateMessage(match, participants);
				String endMessage = leaverNickname + "님이 나갔습니다. 게임이 종료되었습니다.";
				gameState.setLastPlayInfo(endMessage);

				// 게임 종료 브로드캐스트
				broadcastToMatch(message.getMatchId(), "GAME_END", gameState, endMessage);
			}
		}

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
							.guestId(p.getGuestId())
							.guestId(p.getGuestId())
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

	// 턴 종료 대기
	@Transactional(readOnly = true)
	public void notifyTurnEndWaiting(Long matchId, MatchParticipant endedParticipant) {
		Match match = matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
		GameStateMessage gameState = createGameStateMessage(match, participants);

		String nickname = userRepository.findById(endedParticipant.getGuestId())
				.map(User::getNickname)
				.orElse("Player " + endedParticipant.getPlayerIndex());

		Set<Long> endedGuestIds = playRepository.findTurnEndsByMatchAndTurn(matchId, match.getTurnCount())
				.stream()
				.map(Play::getGuestId)
				.collect(Collectors.toSet());

		List<Long> waitingGuestIds = participants.stream()
				.map(MatchParticipant::getGuestId)
				.filter(id -> !endedGuestIds.contains(id))
				.collect(Collectors.toList());

		gameState.setLastPlayInfo(nickname + "님이 턴을 종료했습니다. 상대 종료 대기 중");

		TurnStatusMessage payload = TurnStatusMessage.builder()
				.matchId(matchId)
				.currentTurn(match.getTurnCount())
				.endedParticipantId(endedParticipant.getId())
				.endedGuestId(endedParticipant.getGuestId())
				.waitingGuestIds(waitingGuestIds)
				.waitingForOpponent(!waitingGuestIds.isEmpty())
				.bothPlayersEnded(false)
				.nextTurn(null)
				.gameState(gameState)
				.build();

		broadcastToMatch(matchId, "TURN_WAITING", payload, nickname + "님이 턴을 종료했습니다.");
	}

	@Transactional(readOnly = true)
	public void notifyTurnStart(Long matchId, TurnService.TurnEndResult turnResult) {
		Match match = matchRepository.findById(matchId)
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		List<MatchParticipant> participants = matchParticipantRepository.findByMatch_MatchId(matchId);
		GameStateMessage gameState = createGameStateMessage(match, participants);
		gameState.setLastPlayInfo("턴 " + turnResult.getNextTurn() + "이 시작되었습니다.");

		// 각 플레이어의 카드 배치 정보 수집
		Map<Long, List<TurnStatusMessage.CardPlayInfo>> playerCardPlays = new HashMap<>();
		for (MatchParticipant participant : participants) {
			List<Play> plays = playRepository.findByMatch_MatchIdAndGuestId(matchId, participant.getGuestId());

			// isTurnEnd가 false인 플레이만 필터링 (실제 카드 플레이)
			List<TurnStatusMessage.CardPlayInfo> cardPlays = plays.stream()
					.filter(play -> !play.getIsTurnEnd() && play.getCard() != null)
					.map(play -> TurnStatusMessage.CardPlayInfo.builder()
							.cardId(play.getCard().getCardId())
							.cardName(play.getCard().getName())
							.cardImageUrl(play.getCard().getImageUrl())
							.slotIndex(play.getSlotIndex())
							.position(play.getCardPosition())
							.cost(play.getCard().getCost())
							.power(play.getPowerSnapshot())
							.faction(play.getCard().getFaction())
							.build())
					.toList();

			playerCardPlays.put(participant.getGuestId(), cardPlays);
		}

		TurnStatusMessage payload = TurnStatusMessage.builder()
				.matchId(matchId)
				.currentTurn(match.getTurnCount())
				.waitingGuestIds(List.of())
				.waitingForOpponent(false)
				.bothPlayersEnded(true)
				.nextTurn(turnResult.getNextTurn())
				.gameState(gameState)
				.locationPowerResult(turnResult.getLocationPowerResult())
				.playerCardPlays(playerCardPlays)
				.build();

		broadcastToMatch(matchId, "TURN_START", payload, "턴 " + turnResult.getNextTurn() + "이 시작되었습니다.");
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

	// 게임 종료 처리
	@Transactional
	public void processGameEnd(Long matchId) {
		log.info("게임 종료 처리 시작: matchId={}", matchId);

		try {
			// 승자 판정 및 통계 업데이트
			log.info("endGameAndDetermineWinner 호출 전: matchId={}", matchId);
			GameCalculationService.GameEndResult endResult = gameCalculationService
					.endGameAndDetermineWinner(matchId);
			log.info("endGameAndDetermineWinner 호출 완료: matchId={}, winnerId={}",
					matchId, endResult.getWinnerId());

			// 최종 게임 상태 생성
			Match match = matchRepository.findById(matchId)
					.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

			log.info("게임 종료 처리 - 매치 상태 확인: matchId={}, status={}, winnerId={}",
					matchId, match.getStatus(), match.getWinnerId());

			List<MatchParticipant> participants = matchParticipantRepository
					.findByMatch_MatchId(matchId);

			GameStateMessage gameState = createGameStateMessage(match, participants);

			String winnerNickname = Optional.ofNullable(endResult.getWinnerNickname())
					.filter(nick -> !nick.isBlank())
					.orElse("플레이어1");
			String loserNickname = Optional.ofNullable(endResult.getLoserNickname())
					.filter(nick -> !nick.isBlank())
					.orElse("플레이어2");

			String winnerMessage = (endResult.getWinnerNickname() != null && !endResult.getWinnerNickname().isEmpty())
					? endResult.getWinnerNickname() + " 승리!"
					: "무승부";

			String winnerCapturedLocations = endResult.getPlayer1CapturedLocationNames().isEmpty()
					? "없음"
					: endResult.getPlayer1CapturedLocationNames().stream().collect(Collectors.joining(", "));
			String loserCapturedLocations = endResult.getPlayer2CapturedLocationNames().isEmpty()
					? "없음"
					: endResult.getPlayer2CapturedLocationNames().stream().collect(Collectors.joining(", "));

			gameState.setLastPlayInfo(String.format(
					"%s \n" +
							"%s님께서 점령한 지역: %s \n" + // 이긴 사람
							"%s님께서 점령한 지역: %s \n" + // 진 사람
							"%s님의 총 파워: %d \n" +
							"%s님의 총 파워: %d",
					winnerMessage,
					winnerNickname,
					winnerCapturedLocations,
					loserNickname,
					loserCapturedLocations,
					winnerNickname,
					endResult.getPlayer1TotalPower(),
					loserNickname,
					endResult.getPlayer2TotalPower()));

			// 게임 종료 브로드캐스트
			broadcastToMatch(matchId, "GAME_END", gameState, winnerMessage);
			log.info("게임 종료 브로드캐스트 완료: matchId={}", matchId);
		} catch (Exception e) {
			log.error("게임 종료 처리 중 오류 발생: matchId={}, error={}", matchId, e.getMessage(), e);
			throw e;
		}
	}
}