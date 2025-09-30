package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.model.request.MatchCreateReq;
import com.snaptale.backend.match.model.request.MatchUpdateReq;
import com.snaptale.backend.match.model.response.MatchRes;
import com.snaptale.backend.match.repository.MatchRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;

    // 매치 생성
    @Transactional
    public MatchRes createMatch(MatchCreateReq request) {
        Match match = Match.builder()
                .status(request.status())
                .winnerId(request.winnerId())
                .turnCount(request.turnCount() != null ? request.turnCount() : 0) // 기본값 0
                .endedAt(request.endedAt())
                .build();
        matchRepository.save(match);
        return MatchRes.from(match);
    }

    // 특정 매치 조회
    public MatchRes getMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
        return MatchRes.from(match);
    }

    // 매치 전체 조회
    public List<MatchRes> getMatches() {
        return matchRepository.findAll().stream()
                .map(MatchRes::from)
                .toList();
    }

    // 매치 수정
    @Transactional
    public MatchRes updateMatch(Long matchId, MatchUpdateReq request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
        match.apply(request);
        matchRepository.save(match);
        return MatchRes.from(match);
    }

    // 매치 삭제
    @Transactional
    public Long deleteMatch(Long matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
        matchRepository.delete(match);
        return matchId;
    }
}
