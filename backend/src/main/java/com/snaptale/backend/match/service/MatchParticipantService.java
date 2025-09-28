package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.MatchParticipant;
import com.snaptale.backend.match.model.request.MatchParticipantCreateReq;
import com.snaptale.backend.match.model.request.MatchParticipantUpdateReq;
import com.snaptale.backend.match.model.response.MatchParticipantRes;
import com.snaptale.backend.match.repository.MatchParticipantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchParticipantService {

    private final MatchParticipantRepository matchParticipantRepository;

    // 매치 참가자 생성
    @Transactional
    public MatchParticipantRes createMatchParticipant(MatchParticipantCreateReq request) {
        MatchParticipant matchParticipant = MatchParticipant.builder()
                .match(request.match())
                .finalScore(request.finalScore())
                .playerIndex(request.playerIndex())
                .deckPreset(request.deckPreset())
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
        matchParticipant.apply(request);
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
