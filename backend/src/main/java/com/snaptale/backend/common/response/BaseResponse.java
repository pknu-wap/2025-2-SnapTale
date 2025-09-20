package com.snaptale.backend.common.response;

public record BaseResponse<T>(
        boolean success,
        String code,
        String message,
        T result
) {
    public BaseResponse(BaseResponseStatus status, T result) {
        this(status.getHttpStatus().is2xxSuccessful(), status.name(), status.getMessage(), result);
    }
    public BaseResponse(BaseResponseStatus status) { this(status, null); }
}

