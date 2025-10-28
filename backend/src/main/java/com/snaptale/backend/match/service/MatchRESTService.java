package com.snaptale.backend.match.service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.model.response.MatchJoinRes;
import com.snaptale.backend.match.model.response.MatchStartRes;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.websocket.message.GameStateMessage;
import com.snaptale.backend.match.websocket.message.MatchJoinMessage;
import com.snaptale.backend.match.websocket.message.MatchStartMessage;
import com.snaptale.backend.user.entity.User;
import com.snaptale.backend.user.repository.UserRepository;
import com.snaptale.backend.websocket.service.WebSocketSessionManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
	private final GameFlowService gameFlowService;
	private final WebSocketSessionManager sessionManager;

	// 매치 참가 처리
	@Transactional
	public MatchJoinRes joinMatch(MatchJoinMessage message) {
		// 서버에서 sessionId 생성
		String sessionId = "http-session-" + System.currentTimeMillis() + "-" + Math.random();
		message.setSessionId(sessionId);

		log.info("매치 참가 처리: matchId={}, userId={}, nickname={}, sessionId={}",
				message.getMatchId(), message.getUserId(), message.getNickname(), sessionId);

		// 매치 존재 여부 확인
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

		// 세션 등록
		sessionManager.registerSession(
				sessionId,
				message.getUserId(),
				message.getMatchId());

		// 간단한 게임 상태 생성 (매치 참가 시에는 게임 진행 전이므로 파워 계산 불필요)
		GameStateMessage gameState = GameStateMessage.builder()
				.matchId(match.getMatchId())
				.status(match.getStatus().name())
				.currentRound(match.getTurnCount())
				.participantScores(List.of()) // 빈 리스트, 게임 시작 전이므로
				.build();

		String responseMessage = message.getNickname() + "님이 입장했습니다.";

		return MatchJoinRes.success(message.getMatchId(), responseMessage, gameState);
	}

	// 매치 시작 처리
	@Transactional
	public MatchStartRes startMatch(MatchStartMessage message) {
		log.info("매치 시작 처리: matchId={}", message.getMatchId());

		// 게임 시작 로직 실행
		gameFlowService.startGame(message.getMatchId());

		// 게임 상태 생성
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository
				.findByMatch_MatchId(message.getMatchId());

		GameStateMessage gameState = createGameStateMessage(match, participants);

		return MatchStartRes.success(message.getMatchId(), "게임이 시작되었습니다!", gameState);
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
}
