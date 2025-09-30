package com.snaptale.backend.user.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snaptale.backend.user.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import com.snaptale.backend.user.model.UserCreateReq;
import com.snaptale.backend.user.model.UserUpdateReq;
import com.snaptale.backend.user.model.UserRes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
@Tag(name = "User", description = "User API")
public class UserController {
    private final UserService userService;

    // 테스트 완료
    @Operation(summary = "유저 생성", description = "유저를 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "유저 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PostMapping
    public BaseResponse<UserRes> createUser(@RequestBody UserCreateReq request) {
        return new BaseResponse<>(BaseResponseStatus.CREATED, userService.createUser(request));
    }

    // 테스트 완료
    @Operation(summary = "유저 조회", description = "유저를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "유저 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping("/{userId}")
    public BaseResponse<UserRes> getUser(@PathVariable Long userId) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, userService.getUser(userId));
    }

    // 테스트 완료
    @Operation(summary = "유저 목록 조회", description = "유저 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "유저 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @GetMapping
    public BaseResponse<List<UserRes>> getUsers() {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, userService.getUsers());
    }

    // 테스트 완료
    @Operation(summary = "유저 수정", description = "유저를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "유저 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    })
    @PatchMapping("/{userId}")
    public BaseResponse<UserRes> updateUser(@PathVariable Long userId, @RequestBody UserUpdateReq request) {
        return new BaseResponse<>(BaseResponseStatus.SUCCESS, userService.updateUser(userId, request));
    }

    // 테스트 완료
    @Operation(summary = "유저 삭제", description = "유저를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "유저 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "잘못된 요청"),
    })
    @DeleteMapping("/{userId}")
    public BaseResponse<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return new BaseResponse<>(BaseResponseStatus.SUCCESS);
    }
}
