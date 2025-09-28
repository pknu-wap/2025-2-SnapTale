package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.model.request.PlayCreateReq;
import com.snaptale.backend.match.model.request.PlayUpdateReq;
import com.snaptale.backend.match.model.response.PlayRes;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayService {

    private final PlayRepository playRepository;

    // 플레이 생성
    @Transactional
    public PlayRes createPlay(PlayCreateReq request) {
        Play play = Play.builder()
                .match(request.match())
                .turnCount(request.turnCount())
                .card(request.card())
                .slotIndex(request.slotIndex())
                .powerSnapshot(request.powerSnapshot())
                .build();
        playRepository.save(play);
        return PlayRes.from(play);
    }

    // 플레이 조회
    public PlayRes getPlay(Long playId) {
        return PlayRes.from(playRepository.findById(playId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.PLAY_NOT_FOUND)));
    }

    // 플레이 전체 조회
    public List<PlayRes> getPlays() {
        return playRepository.findAll().stream()
                .map(PlayRes::from)
                .toList();
    }

    // 플레이 수정
    @Transactional
    public PlayRes updatePlay(Long playId, PlayUpdateReq request) {
        Play play = playRepository.findById(playId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.PLAY_NOT_FOUND));
        play.apply(request);
        playRepository.save(play);
        return PlayRes.from(play);
    }

    // 플레이 삭제
    @Transactional
    public Long deletePlay(Long playId) {
        Play play = playRepository.findById(playId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.PLAY_NOT_FOUND));
        playRepository.delete(play);
        return playId;
    }
}
