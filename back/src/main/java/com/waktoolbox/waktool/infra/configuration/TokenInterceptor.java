package com.waktoolbox.waktool.infra.configuration;

import com.waktoolbox.waktool.utils.JwtHelper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseCookie;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.time.Clock;
import java.time.Duration;
import java.util.Date;
import java.util.Optional;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;
import static com.waktoolbox.waktool.utils.JwtHelper.USERNAME;

@Configuration
@RequiredArgsConstructor
public class TokenInterceptor implements HandlerInterceptor {
    private final JwtHelper _jwtHelper;
    private final Clock _clock;

    private static final Duration REFRESH_THRESHOLD = Duration.ofHours(4);

    @Bean
    public MappedInterceptor discordIdInterceptor() {
        return new MappedInterceptor(null, new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                Optional<Claims> optClaims = _jwtHelper.extractFromRequest(request);
                request.setAttribute("discordId", optClaims.map(claims -> claims.get(DISCORD_ID)));

                // Sliding window: refresh token if expiring within threshold
                optClaims.ifPresent(claims -> {
                    try {
                        Date expiration = claims.getExpiration();
                        if (expiration != null) {
                            long remainingMs = expiration.getTime() - _clock.instant().toEpochMilli();
                            if (remainingMs > 0 && remainingMs < REFRESH_THRESHOLD.toMillis()) {
                                String discordId = (String) claims.get(DISCORD_ID);
                                String username = (String) claims.get(USERNAME);
                                if (discordId != null && username != null) {
                                    Claims newClaims = _jwtHelper.buildClaimsFromValues(
                                            DISCORD_ID, discordId,
                                            USERNAME, username
                                    );
                                    String newToken = _jwtHelper.generateJwt(newClaims, null);
                                    ResponseCookie cookie = ResponseCookie.from("token", newToken)
                                            .httpOnly(true)
                                            .secure(true)
                                            .sameSite("None")
                                            .path("/")
                                            .maxAge(60L * 60 * 24) // 1 day
                                            .build();
                                    response.addHeader("Set-Cookie", cookie.toString());
                                }
                            }
                        }
                    } catch (Exception ignored) {
                        // Do not fail the request if token refresh fails
                    }
                });

                return true;
            }
        });
    }

}
