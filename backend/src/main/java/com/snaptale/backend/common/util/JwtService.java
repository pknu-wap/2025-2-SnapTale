package com.snaptale.backend.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class JwtService {

    // TODO: 현재는 로그인 기능 구현 없음. 추후 로그인 기능 구현 시 작성할 것
    public String issueToken(String subject) {
        log.warn("JWT issuance is not implemented yet. Subject: {}", subject);
        throw new UnsupportedOperationException("JWT issuance not implemented");
    }
}
