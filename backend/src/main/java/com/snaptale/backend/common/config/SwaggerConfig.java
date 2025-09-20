package com.snaptale.backend.common.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Snaptale API")
                        .description("REST API specification for the Snaptale")
                        .version("v1")
                        .contact(new Contact()
                                .name("Snaptale")
                                .url("https://github.com/pknu-wap/2025-2-SnapTale"))
                );
    }
}
