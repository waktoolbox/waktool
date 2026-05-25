package com.waktoolbox.waktool.infra.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfiguration {
    @Value("${waktool.base-url}")
    private String _baseUrl;

    private String[] getAllowedOrigins() {
        // Allow both www and non-www variants of the base URL
        if (_baseUrl != null && _baseUrl.contains("://www.")) {
            return new String[]{_baseUrl, _baseUrl.replace("://www.", "://")};
        }
        return new String[]{_baseUrl};
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = getAllowedOrigins();
                registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "POST", "PUT", "DELETE").allowCredentials(true);
                registry.addMapping("/socket/**").allowedOrigins(origins).allowedMethods("GET", "POST").allowCredentials(true);
            }
        };
    }
}
