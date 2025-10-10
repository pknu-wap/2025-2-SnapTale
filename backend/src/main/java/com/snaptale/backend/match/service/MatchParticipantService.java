package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.deck.entity.DeckPreset;
import com.snaptale.backend.deck.repository.DeckPresetRepository;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.model.request.MatchParticipantCreateReq;
import com.snaptale.backend.match.model.request.MatchParticipantUpdateReq;
import com.snaptale.backend.match.model.response.MatchParticipantRes;
import com.snaptale.backend.match.repository.MatchParticipantRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchParticipantService {

        private final MatchParticipantRepository matchParticipantRepository;
        private final MatchRepository matchRepository;
        private final DeckPresetRepository deckPresetRepository;
        private final UserRepository userRepository;

        // 매치 참가자 생성
        @Transactional
        public MatchParticipantRes createMatchParticipant(MatchParticipantCreateReq request) {
                // Match, DeckPreset, User 엔티티 조회
                Match match = matchRepository.findById(request.matchId())
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

                DeckPreset deckPreset = deckPresetRepository.findById(request.deckPresetId())
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));

                // guestId가 실제 존재하는 사용자인지 검증
                userRepository.findById(request.guestId())
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

                MatchParticipant matchParticipant = MatchParticipant.builder()
                                .finalScore(request.finalScore())
                                .playerIndex(request.playerIndex())
                                .deckPreset(deckPreset)
                                .match(match)
                                .guestId(request.guestId())
                                .build();
                matchParticipantRepository.save(matchParticipant);
                return MatchParticipantRes.from(matchParticipant);
        }

        // 매치 참가자 조회
        public MatchParticipantRes getMatchParticipant(Long matchParticipantId) {
                MatchParticipant matchParticipant = matchParticipantRepository.findById(matchParticipantId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));
                return MatchParticipantRes.from(matchParticipant);
        }

        // 매치 참가자 전체 조회
        public List<MatchParticipantRes> getMatchParticipants() {
                return matchParticipantRepository.findAll().stream()
                                .map(MatchParticipantRes::from)
                                .toList();
        }

        // 매치 참가자 수정
        @Transactional
        public MatchParticipantRes updateMatchParticipant(Long matchParticipantId, MatchParticipantUpdateReq request) {
                MatchParticipant matchParticipant = matchParticipantRepository.findById(matchParticipantId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));

                // Match, DeckPreset, User 엔티티 조회 (필요한 경우에만)
                Match match = null;
                DeckPreset deckPreset = null;

                if (request.matchId() != null) {
                        match = matchRepository.findById(request.matchId())
                                        .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
                }

                if (request.deckPresetId() != null) {
                        deckPreset = deckPresetRepository.findById(request.deckPresetId())
                                        .orElseThrow(() -> new BaseException(BaseResponseStatus.DECK_PRESET_NOT_FOUND));
                }

                // guestId가 변경되는 경우 검증
                if (request.guestId() != null) {
                        userRepository.findById(request.guestId())
                                        .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
                }

                matchParticipant.apply(request, match, deckPreset);
                matchParticipantRepository.save(matchParticipant);
                return MatchParticipantRes.from(matchParticipant);
        }

        // 매치 참가자 삭제
        @Transactional
        public Long deleteMatchParticipant(Long matchParticipantId) {
                MatchParticipant matchParticipant = matchParticipantRepository.findById(matchParticipantId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_PARTICIPANT_NOT_FOUND));
                matchParticipantRepository.delete(matchParticipant);
                return matchParticipantId;
        }
}
