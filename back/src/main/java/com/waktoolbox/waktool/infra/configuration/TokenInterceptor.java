package com.waktoolbox.waktool.infra.configuration;

import com.waktoolbox.waktool.utils.JwtHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.handler.MappedInterceptor;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;

@Configuration
@RequiredArgsConstructor
public class TokenInterceptor implements HandlerInterceptor {
    private final JwtHelper _jwtHelper;

    @Bean
    public MappedInterceptor discordIdInterceptor() {
        return new MappedInterceptor(null, new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                request.setAttribute("discordId", _jwtHelper.extractFromRequest(request).map(claims -> claims.get(DISCORD_ID)));
                return true;
            }
        });
    }

}
