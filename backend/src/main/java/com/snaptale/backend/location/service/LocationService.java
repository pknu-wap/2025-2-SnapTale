package com.snaptale.backend.location.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import com.snaptale.backend.common.exceptions.BaseException;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.location.entity.Location;
import com.snaptale.backend.location.model.LocationCreateReq;
import com.snaptale.backend.location.model.LocationRes;
import com.snaptale.backend.location.model.LocationUpdateReq;
import com.snaptale.backend.location.repository.LocationRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;

    // 지역 생성
    @Transactional
    public LocationRes createLocation(LocationCreateReq request) {
        Location location = Location.builder()
                .name(request.name())
                .imageUrl(request.imageUrl())
                .effectDesc(request.effectDesc())
                .isActive(request.active())
                .build();
        locationRepository.save(location);
        return LocationRes.from(location);
    }

    // 모든 지역 조회
    public List<LocationRes> getLocations() {
        return locationRepository.findAll().stream()
                .map(LocationRes::from)
                .toList();
    }

    // 특정 지역 조회
    public LocationRes getLocation(Long locationId) {
        return locationRepository.findById(locationId)
                .map(LocationRes::from)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.LOCATION_NOT_FOUND));
    }

    // 지역 수정
    @Transactional
    public LocationRes updateLocation(Long locationId, LocationUpdateReq request) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.LOCATION_NOT_FOUND));
        location.setName(request.name());
        location.setImageUrl(request.imageUrl());
        location.setEffectDesc(request.effectDesc());
        location.setActive(request.active());
        locationRepository.save(location);
        return LocationRes.from(location);
    }

    // 지역 삭제
    @Transactional
    public Long deleteLocation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new BaseException(BaseResponseStatus.LOCATION_NOT_FOUND));
        locationRepository.delete(location);
        return locationId;
    }

}
