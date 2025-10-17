package com.snaptale.backend.match.controller;

import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.service.GameFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Tag(name = "Match Turn", description = "매치 턴 진행 API")
public class MatchTurnController {
    private final GameFlowService gameFlowService;

    @PostMapping("/{matchId}/turns/start")
    @Operation(summary = "턴 시작", description = "다음 턴을 시작하고 참가자들의 드로우 결과를 반환합니다.")
    public BaseResponse<TurnStartRes> startNextTurn(@PathVariable Long matchId) {
        log.info("턴 시작 요청: matchId={}", matchId);
        GameFlowService.TurnStartResult result = gameFlowService.startNextTurn(matchId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, TurnStartRes.from(result));
    }
}
