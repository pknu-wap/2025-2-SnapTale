package com.snaptale.backend.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum BaseResponseStatus {
    // 성공 관련 상태
    SUCCESS(HttpStatus.OK, "SUCCESS"),
    CREATED(HttpStatus.CREATED, "CREATED"),

    // 요청 오류 관련 상태
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "BAD_REQUEST"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "NOT_FOUND"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND"),
    CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND"),
    DECK_NOT_FOUND(HttpStatus.NOT_FOUND, "DECK_NOT_FOUND"),
    DECK_PRESET_NOT_FOUND(HttpStatus.NOT_FOUND, "DECK_PRESET_NOT_FOUND"),
    LOCATION_NOT_FOUND(HttpStatus.NOT_FOUND, "LOCATION_NOT_FOUND"),
    MATCH_NOT_FOUND(HttpStatus.NOT_FOUND, "MATCH_NOT_FOUND"),
    INVALID_MATCH_STATE(HttpStatus.BAD_REQUEST, "INVALID_MATCH_STATE"),

    // 서버 오류 관련 상태
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");

    private final HttpStatus httpStatus;
    private final String message;
}
