package com.waktoolbox.waktool.infra.configuration;

import com.waktoolbox.waktool.utils.JwtHelper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.handler.MappedInterceptor;
import org.springframework.web.util.WebUtils;

@Configuration
@RequiredArgsConstructor
public class TokenInterceptor implements HandlerInterceptor {
    private final JwtHelper _jwtHelper;

    @Bean
    public MappedInterceptor discordIdInterceptor() {
        return new MappedInterceptor(null, new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                Cookie token = WebUtils.getCookie(request, "token");
                if (token == null) return true;

                try {
                    request.setAttribute("discordId", _jwtHelper.decodeJwt(token.getValue()).get("discord_id"));
                } catch (RuntimeException e) {
                    // ignored
                }
                return true;
            }
        });
    }
}
