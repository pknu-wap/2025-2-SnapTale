package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.card.entity.Card;
import com.snaptale.backend.card.repository.CardRepository;
import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.Match;
import com.snaptale.backend.match.entity.Play;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.match.repository.PlayRepository;
import com.snaptale.backend.match.model.request.PlayCreateReq;
import com.snaptale.backend.match.model.request.PlayUpdateReq;
import com.snaptale.backend.match.model.response.PlayRes;
import com.snaptale.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayService {

    private final PlayRepository playRepository;
    private final MatchRepository matchRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    // 플레이 생성
    @Transactional
    public PlayRes createPlay(PlayCreateReq request) {
        // Match, Card, User 엔티티 조회
        Match match = matchRepository.findById(request.matchId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        Card card = cardRepository.findById(request.cardId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));

        // guestId가 실제 존재하는 사용자인지 검증
        userRepository.findById(request.guestId())
                .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));

        Play play = Play.builder()
                .match(match)
                .turnCount(request.turnCount())
                .guestId(request.guestId())
                .card(card)
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

        // Match, Card, User 엔티티 조회 (필요한 경우에만)
        Match match = null;
        Card card = null;

        if (request.matchId() != null) {
            match = matchRepository.findById(request.matchId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));
        }

        if (request.cardId() != null) {
            card = cardRepository.findById(request.cardId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.CARD_NOT_FOUND));
        }

        // guestId가 변경되는 경우 검증
        if (request.guestId() != null) {
            userRepository.findById(request.guestId())
                    .orElseThrow(() -> new BaseException(BaseResponseStatus.USER_NOT_FOUND));
        }

        play.apply(request, match, card);
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
