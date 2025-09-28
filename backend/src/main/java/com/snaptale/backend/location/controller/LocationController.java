package com.snaptale.backend.location.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.location.model.LocationCreateReq;
import com.snaptale.backend.location.model.LocationRes;
import com.snaptale.backend.location.model.LocationUpdateReq;
import com.snaptale.backend.location.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Location API", description = "지역 CRUD API")
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Validated
public class LocationController {

    private final LocationService locationService;

    @Operation(summary = "지역 생성", description = "지역을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "지역 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<LocationRes> createLocation(@Valid @RequestBody LocationCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, locationService.createLocation(request));
    }

    @Operation(summary = "지역 목록 조회", description = "지역 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "지역 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<LocationRes>> getLocations() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, locationService.getLocations());
    }

    @Operation(summary = "지역 하나 조회", description = "지역을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "지역 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{locationId}")
    public BaseResponse<LocationRes> getLocation(@PathVariable Long locationId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, locationService.getLocation(locationId));
    }

    @Operation(summary = "지역 수정", description = "지역을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "지역 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{locationId}")
    public BaseResponse<LocationRes> updateLocation(@PathVariable Long locationId,
            @Valid @RequestBody LocationUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, locationService.updateLocation(locationId, request));
    }

    @Operation(summary = "지역 삭제", description = "지역을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "지역 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{locationId}")
    public BaseResponse<Void> deleteLocation(@PathVariable Long locationId) {
        locationService.deleteLocation(locationId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }

}
