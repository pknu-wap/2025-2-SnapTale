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
import com.snaptale.backend.location.entity.Location;
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

    // 특정 매치의 지역들 조회 (없으면 자동 생성)
    @Transactional
    public List<MatchLocationRes> getLocationsByMatchId(Long matchId) {
        List<MatchLocation> found = matchLocationRepository.findByMatchIdWithFetch(matchId);
        if (found.isEmpty()) {
            // 없으면 생성 후 반환
            return assignRandomLocationsToMatch(matchId);
        }
        return found.stream()
                .map(MatchLocationRes::from)
                .toList();
    }

    // 매치에 랜덤 지역 3개 할당
    @Transactional
    public List<MatchLocationRes> assignRandomLocationsToMatch(Long matchId) {
        // Match 조회
        var match = matchRepository.findById(matchId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.MATCH_NOT_FOUND));

        // 모든 활성 지역 조회
        List<Location> allLocations = locationRepository.findAll()
                .stream()
                .filter(loc -> loc.getIsActive() != null && loc.getIsActive())
                .toList();

        if (allLocations.size() < 3) {
            throw new BaseException(BaseResponseStatus.INSUFFICIENT_LOCATIONS);
        }

        // 랜덤으로 3개 선택
        List<Location> selectedLocations = new java.util.ArrayList<>(
                allLocations);
        java.util.Collections.shuffle(selectedLocations);
        selectedLocations = selectedLocations.subList(0, 3);

        // MatchLocation 생성
        List<MatchLocation> matchLocations = new java.util.ArrayList<>();
        for (int i = 0; i < selectedLocations.size(); i++) {
            MatchLocation matchLocation = MatchLocation.builder()
                    .match(match)
                    .slotIndex(i)
                    .location(selectedLocations.get(i))
                    .revealedTurn(null)
                    .build();
            matchLocations.add(matchLocation);
        }

        matchLocationRepository.saveAll(matchLocations);

        return matchLocations.stream()
                .map(MatchLocationRes::from)
                .toList();
    }
}
