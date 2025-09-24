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
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.model.request.MatchCreateReq;
import com.snaptale.backend.match.model.request.MatchUpdateReq;
import com.snaptale.backend.match.model.response.MatchRes;
import com.snaptale.backend.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Validated
@Tag(name = "Match API", description = "매치 CRUD API")
public class MatchController {

    private final MatchService matchService;

    @Operation(summary = "매치 생성", description = "매치를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "매치 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<MatchRes> createMatch(@Valid @RequestBody MatchCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, matchService.createMatch(request));
    }

    @Operation(summary = "매치 조회", description = "매치를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "매치 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{matchId}")
    public BaseResponse<MatchRes> getMatch(@PathVariable Long matchId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, matchService.getMatch(matchId));
    }

    @Operation(summary = "매치 전체 조회", description = "매치 전체를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "매치 전체 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<MatchRes>> getMatches() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, matchService.getMatches());
    }

    @Operation(summary = "매치 수정", description = "매치를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "매치 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{matchId}")
    public BaseResponse<MatchRes> updateMatch(@PathVariable Long matchId, @Valid @RequestBody MatchUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, matchService.updateMatch(matchId, request));
    }

    @Operation(summary = "매치 삭제", description = "매치를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "매치 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{matchId}")
    public BaseResponse<Void> deleteMatch(@PathVariable Long matchId) {
        matchService.deleteMatch(matchId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
