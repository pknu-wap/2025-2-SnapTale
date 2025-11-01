package com.snaptale.backend.match.service;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.entity.MatchLocation;
import com.snaptale.backend.match.model.request.MatchLocationCreateReq;
import com.snaptale.backend.match.model.request.MatchLocationUpdateReq;
import com.snaptale.backend.match.model.response.MatchLocationRes;
import com.snaptale.backend.match.repository.MatchLocationRepository;
import com.snaptale.backend.match.repository.MatchRepository;
import com.snaptale.backend.location.repository.LocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchLocationService {

        private final MatchLocationRepository matchLocationRepository;
        private final MatchRepository matchRepository;
        private final LocationRepository locationRepository;

        // 생성
        @Transactional
        public MatchLocationRes createMatchLocation(MatchLocationCreateReq request) {
                // Match와 Location 엔티티 조회
                var match = matchRepository.findById(request.matchId())
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

                var location = locationRepository.findById(request.locationId())
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.LOCATION_NOT_FOUND));

                MatchLocation matchLocation = MatchLocation.builder()
                                .match(match)
                                .slotIndex(request.slotIndex())
                                .location(location)
                                .revealedTurn(request.revealedTurn())
                                .build();
                matchLocationRepository.save(matchLocation);
                return MatchLocationRes.from(matchLocation);
        }

        // 조회
        @Transactional(readOnly = true)
        public MatchLocationRes getMatchLocation(Long matchLocationId) {
                return MatchLocationRes.from(matchLocationRepository.findByIdWithFetch(matchLocationId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_LOCATION_NOT_FOUND)));
        }

        // 전체 조회
        @Transactional(readOnly = true)
        public List<MatchLocationRes> getMatchLocations() {
                return matchLocationRepository.findAllWithFetch().stream()
                                .map(MatchLocationRes::from)
                                .toList();
        }

        // 수정
        @Transactional
        public MatchLocationRes updateMatchLocation(Long matchLocationId, MatchLocationUpdateReq request) {
                MatchLocation matchLocation = matchLocationRepository.findById(matchLocationId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_LOCATION_NOT_FOUND));
                matchLocation.apply(request);
                matchLocationRepository.save(matchLocation);
                return MatchLocationRes.from(matchLocation);
        }

        // 삭제
        @Transactional
        public Long deleteMatchLocation(Long matchLocationId) {
                MatchLocation matchLocation = matchLocationRepository.findById(matchLocationId)
                                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_LOCATION_NOT_FOUND));
                matchLocationRepository.delete(matchLocation);
                return matchLocationId;
        }
}
