package com.snaptale.backend.match.controller;

import java.util.List;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.model.request.PlayCreateReq;
import com.snaptale.backend.match.model.request.PlayUpdateReq;
import com.snaptale.backend.match.model.response.PlayRes;
import com.snaptale.backend.match.service.PlayService;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/plays")
@RequiredArgsConstructor
@Validated
@Tag(name = "Play API", description = "Play API")
public class PlayController {
    private final PlayService playService;

    // 테스트 완
    @Operation(summary = "플레이 생성", description = "플레이를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "플레이 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<PlayRes> createPlay(@Valid @RequestBody PlayCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, playService.createPlay(request));
    }

    // 테스트 완
    @Operation(summary = "플레이 조회", description = "플레이를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "플레이 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{playId}")
    public BaseResponse<PlayRes> getPlay(@PathVariable Long playId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, playService.getPlay(playId));
    }

    // 테스트 완
    @Operation(summary = "플레이 전체 조회", description = "플레이 전체를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "플레이 전체 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<PlayRes>> getPlays() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, playService.getPlays());
    }

    // 테스트 완
    @Operation(summary = "플레이 수정", description = "플레이를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "플레이 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{playId}")
    public BaseResponse<PlayRes> updatePlay(@PathVariable Long playId, @Valid @RequestBody PlayUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, playService.updatePlay(playId, request));
    }

    // 테스트 완
    @Operation(summary = "플레이 삭제", description = "플레이를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "플레이 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{playId}")
    public BaseResponse<Void> deletePlay(@PathVariable Long playId) {
        playService.deletePlay(playId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
