package com.snaptale.backend.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    /**
     * CORS(Cross-Origin Resource Sharing) 설정
     * - 프론트엔드(React, Vue 등)와 백엔드(Spring Boot)가 서로 다른 도메인/포트에서 실행될 때
     *   브라우저 보안 정책(Same-Origin Policy) 때문에 요청이 차단된다.
     * - 이 메서드는 어떤 출처(Origin)에서 백엔드 API를 호출할 수 있는지 허용 범위를 지정한다.
     *
     * 현재 설정:
     * - 모든 경로("/**")에 대해
     * - 모든 Origin("*")에서 접근 허용
     * - GET, POST, PATCH, DELETE, OPTIONS 메서드 허용
     * - 모든 헤더 허용
     * - Credentials(쿠키/세션)는 허용하지 않음
     *
     * 추후 변경사항:
     * - 보안 강화를 위해 배포 환경에서는 allowedOrigins("*") 대신
     *   실제 서비스 도메인(e.g. "https://snaptale.com")만 허용하는 게 좋음.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                        "https://snaptale.p-e.kr",
                        "https://www.snaptale.p-e.kr",
                        "https://snap-tale.netlify.app/"
                        )
                .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/docs/");
    }
}
