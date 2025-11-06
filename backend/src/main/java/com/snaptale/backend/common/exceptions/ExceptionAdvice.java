package com.snaptale.backend.common.exceptions;

import com.snaptale.backend.common.response.BaseResponse;
import com.snaptale.backend.common.response.BaseResponseStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class ExceptionAdvice {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<BaseResponse<Object>> handleBaseException(BaseException e) {
        log.error("BaseException 발생: {}", e.getStatus().getMessage(), e);
        BaseResponse<Object> response = new BaseResponse<>(e.getStatus(), null);
        return ResponseEntity
                .status(e.getStatus().getHttpStatus())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Object>> handleException(Exception e) {
        log.error("예상치 못한 예외 발생", e);
        BaseResponse<Object> response = new BaseResponse<>(
                BaseResponseStatus.INTERNAL_SERVER_ERROR,
                null);
        return ResponseEntity
                .status(BaseResponseStatus.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(response);
    }
}
