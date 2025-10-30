package com.snaptale.backend.match.service;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.entity.MatchStatus;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.model.request.MatchUpdateReq;
import com.snaptale.backend.match.model.response.MatchJoinRes;
import com.snaptale.backend.match.model.response.MatchDetailRes;
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
	private final com.snaptale.backend.deck.repository.DeckPresetRepository deckPresetRepository;

	// 매치 참가 처리
	@Transactional
	public MatchJoinRes joinMatch(MatchJoinMessage message) {
		Match match;

		// matchId가 0이 아닌 경우: 친선전 (특정 매치 참가)
		if (message.getMatchId() != null && message.getMatchId() != 0) {
			match = matchRepository.findById(message.getMatchId())
					.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

			// 매치 상태가 QUEUED가 아니면 참가 불가
			if (match.getStatus() != MatchStatus.QUEUED) {
				throw new BaseException(BaseResponseStatus.INVALID_MATCH_STATUS);
			}

			log.info("친선전 매치 참가: matchId={}, userId={}, nickname={}",
					message.getMatchId(), message.getUserId(), message.getNickname());
		} else {
			// matchId가 0인 경우: 랜덤 매치 (가장 낮은 QUEUED 매치 선택)
			match = matchRepository.findFirstByStatusOrderByMatchIdAsc(MatchStatus.QUEUED)
					.orElse(null);

			if (match == null) {
				// 없으면 새로 생성
				Match newMatch = Match.builder()
						.status(MatchStatus.QUEUED)
						.turnCount(0)
						.build();
				match = matchRepository.save(newMatch);

				// 다른 요청이 동시에 더 낮은 ID로 생성했을 수 있음
				Match existingMatch = matchRepository.findFirstByStatusOrderByMatchIdAsc(MatchStatus.QUEUED)
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

			// todo:임시로 첫 번째 덱 사용, 추후 사용자 설정 덱으로 변경 가능
			DeckPreset deckPreset = deckPresetRepository.findAll().stream()
					.findFirst()
					.orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));

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

		// 게임 상태 생성
		Match match = matchRepository.findById(message.getMatchId())
				.orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
		List<MatchParticipant> participants = matchParticipantRepository
				.findByMatch_MatchId(message.getMatchId());

		GameStateMessage gameState = createGameStateMessage(match, participants);

		return MatchStartRes.success(message.getMatchId(), "게임이 시작되었습니다!", gameState);
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
					return new MatchDetailRes.ParticipantInfo(p.getGuestId(), nickname, p.getEnergy());
				})
				.toList();

		return new MatchDetailRes(
				match.getMatchId(),
				match.getStatus(),
				match.getWinnerId(),
				match.getTurnCount(),
				match.getEndedAt(),
				infos);
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
}
