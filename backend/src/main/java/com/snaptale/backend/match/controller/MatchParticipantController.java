package com.snaptale.backend.match.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import com.snaptale.backend.match.service.MatchParticipantService;
import lombok.RequiredArgsConstructor;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.model.request.MatchParticipantCreateReq;
import com.snaptale.backend.match.model.request.MatchParticipantUpdateReq;
import com.snaptale.backend.match.model.response.MatchParticipantRes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/match-participants")
@RequiredArgsConstructor
@Validated
@Tag(name = "Match Participant API", description = "매치 참가자 CRUD API")
public class MatchParticipantController {

        private final MatchParticipantService matchParticipantService;

        // 테스트 완
        @Operation(summary = "매치 참가자 생성", description = "매치 참가자를 생성합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "매치 참가자 생성 성공"),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        })
        @PostMapping
        public BaseResponse<MatchParticipantRes> createMatchParticipant(
                        @Valid @RequestBody MatchParticipantCreateReq request) {
                return new BaseResponse<>(BaseResponseStatus.CREATED,
                                matchParticipantService.createMatchParticipant(request));
        }

        // 테스트 완
        @Operation(summary = "매치 참가자 조회", description = "매치 참가자를 조회합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "매치 참가자 조회 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @GetMapping("/{matchParticipantId}")
        public BaseResponse<MatchParticipantRes> getMatchParticipant(@PathVariable Long matchParticipantId) {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                                matchParticipantService.getMatchParticipant(matchParticipantId));
        }

        // 테스트 완
        @Operation(summary = "매치 참가자 전체 조회", description = "매치 참가자 전체를 조회합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "매치 참가자 전체 조회 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @GetMapping
        public BaseResponse<List<MatchParticipantRes>> getMatchParticipants() {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS, matchParticipantService.getMatchParticipants());
        }

        // 테스트 완
        @Operation(summary = "매치 참가자 수정", description = "매치 참가자를 수정합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "매치 참가자 수정 성공"),
                        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        })
        @PatchMapping("/{matchParticipantId}")
        public BaseResponse<MatchParticipantRes> updateMatchParticipant(@PathVariable Long matchParticipantId,
                        @Valid @RequestBody MatchParticipantUpdateReq request) {
                return new BaseResponse<>(BaseResponseStatus.SUCCESS,
                                matchParticipantService.updateMatchParticipant(matchParticipantId, request));
        }

        // 테스트 완
        @Operation(summary = "매치 참가자 삭제", description = "매치 참가자를 삭제합니다.")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "매치 참가자 삭제 성공"),
                        @ApiResponse(responseCode = "404", description = "잘못된 요청"),
        })
        @DeleteMapping("/{matchParticipantId}")
        public BaseResponse<Void> deleteMatchParticipant(@PathVariable Long matchParticipantId) {
                matchParticipantService.deleteMatchParticipant(matchParticipantId);
                return new BaseResponse<>(BaseResponseStatus.SUCCESS);
        }
}
