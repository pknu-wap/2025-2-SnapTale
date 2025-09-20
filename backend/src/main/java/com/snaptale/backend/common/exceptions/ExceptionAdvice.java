package com.snaptale.backend.common.exceptions;

import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice  // 모든 @RestController에서 발생한 예외를 여기서 처리
public class ExceptionAdvice {

    /*
     * ================== [ ExceptionAdvice 설명 ] ==================
     * - @RestControllerAdvice:
     *   → 모든 @RestController에서 발생하는 예외를 "한 곳"에서 처리해주는 기능
     *   → try-catch를 매번 쓰지 않고, 공통적으로 예외를 잡아서 응답을 내려줄 수 있음
     *
     * - 전략:
     *   1) 우리만의 예외(BaseException)를 던지면 → 여기서 잡아서 JSON 응답 반환
     *   2) Validation(@Valid) 실패 예외도 공통 처리
     *   3) 그 외 알 수 없는 예외도 일관된 형태로 처리
     *
     * - 장점:
     *   → API 응답 포맷(BaseResponse) 통일
     *   → 팀원들이 컨트롤러 코드에서 try-catch를 직접 안 써도 됨
     *   → 로그를 남겨서 서버 상황을 확인하기 쉬움
     * ==============================================================
     */

    // (1) 우리가 직접 만든 BaseException을 처리하는 핸들러
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<BaseResponse<Void>> handleBaseException(BaseException ex) {
        log.warn("Business exception: {}", ex.getStatus().name());
        return ResponseEntity.status(ex.getStatus().getHttpStatus())
                .body(new BaseResponse<>(ex.getStatus()));
    }

    // (2) @Valid 검증 실패 시 발생하는 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        log.warn("Validation error", ex);
        return ResponseEntity.status(BaseResponseStatus.BAD_REQUEST.getHttpStatus())
                .body(new BaseResponse<>(BaseResponseStatus.BAD_REQUEST));
    }

    // (3) 그 외 예상하지 못한 모든 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Void>> handleException(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.status(BaseResponseStatus.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(new BaseResponse<>(BaseResponseStatus.INTERNAL_SERVER_ERROR));
    }
}
