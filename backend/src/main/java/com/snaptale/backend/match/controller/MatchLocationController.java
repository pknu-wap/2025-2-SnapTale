package com.snaptale.backend.match.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.model.request.MatchLocationCreateReq;
import com.snaptale.backend.match.model.request.MatchLocationUpdateReq;
import com.snaptale.backend.match.model.response.MatchLocationRes;
import com.snaptale.backend.match.service.MatchLocationService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/match-locations")
@RequiredArgsConstructor
@Validated
@Tag(name = "MatchLocation API", description = "매치 지역 CRUD API")
public class MatchLocationController {

        private final MatchLocationService matchLocationService;

        // 테스트 완
        @Operation(summary = "매치 지역 생성", description = "매치 지역를 생성합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "매치 지역 생성 성공"),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        })
        @PostMapping
        public BaseResponse<MatchLocationRes> createMatchLocation(@Valid @RequestBody MatchLocationCreateReq request) {
                return new BaseResponse<>(BaseResponseStatus.CREATED,
                                matchLocationService.createMatchLocation(request));
        }

        // 테스트 완
        @Operation(summary = "매치 지역 전체 조회", description = "매치 지역 전체을 조회합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "매치 지역 전체 조회 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @GetMapping
        public BaseResponse<List<MatchLocationRes>> getMatchLocations() {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS, matchLocationService.getMatchLocations());
        }

        // 테스트 완
        @Operation(summary = "특정 매치 지역 하나 조회", description = "특정 매치 지역를 조회합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "특정 매치 지역 조회 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @GetMapping("/{matchLocationId}")
        public BaseResponse<MatchLocationRes> getMatchLocation(@PathVariable Long matchLocationId) {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                                matchLocationService.getMatchLocation(matchLocationId));
        }

        // 테스트 완
        @Operation(summary = "매치 지역 수정", description = "매치 지역을 수정합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "매치 지역 수정 성공"),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        })
        @PatchMapping("/{matchLocationId}")
        public BaseResponse<MatchLocationRes> updateMatchLocation(@PathVariable Long matchLocationId,
                        @Valid @RequestBody MatchLocationUpdateReq request) {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                                matchLocationService.updateMatchLocation(matchLocationId, request));
        }

        // 테스트 완
        @Operation(summary = "매치 지역 삭제", description = "매치 지역을 삭제합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "매치 지역 삭제 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @DeleteMapping("/{matchLocationId}")
        public BaseResponse<Void> deleteMatchLocation(@PathVariable Long matchLocationId) {
                matchLocationService.deleteMatchLocation(matchLocationId);
                return new BaseResponse<>(BaseResponseStatus.SUCCESS);
        }
}
