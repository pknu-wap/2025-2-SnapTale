package com.snaptale.backend.match.controller;

import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.match.model.request.GameInitReq;
import com.snaptale.backend.match.model.response.GameInitRes;
import com.snaptale.backend.match.service.GameFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

// 게임 전체 플로우를 관리하는 REST API 컨트롤러
@Slf4j
@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
@Tag(name = "Game", description = "게임 플로우 API")
public class GameController {

    private final GameFlowService gameFlowService;

    // 게임 초기화
    // - 두 플레이어를 매칭하고 게임을 시작
    // - 각 플레이어의 초기 핸드 카드를 드로우
    // - 3개의 Location을 랜덤으로 선택
    @PostMapping("/init")
    @Operation(summary = "게임 초기화", description = "두 플레이어를 매칭하고 게임을 초기화합니다.")
    public BaseResponse<GameInitRes> initializeGame(@RequestBody GameInitReq request) {
        log.info("게임 초기화 요청: player1Id={}, player2Id={}, deck1Id={}, deck2Id={}",
                request.player1Id(), request.player2Id(), request.deck1Id(), request.deck2Id());

        GameFlowService.GameInitializationResult result = gameFlowService.initializeGame(
                request.player1Id(),
                request.player2Id(),
                request.deck1Id(),
                request.deck2Id());// 클라이언트에서 덱 아이디 전달인데 서버에서 덱 아이디 목록 조회해서 랜덤으로 선택으로 바꿀까..

        GameInitRes response = GameInitRes.from(result);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, response);
    }
}
