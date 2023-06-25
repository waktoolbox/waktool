package com.waktoolbox.waktool.infra.configuration;

import com.waktoolbox.waktool.utils.JwtHelper;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;
import static com.waktoolbox.waktool.utils.JwtHelper.USERNAME;

@Component
@RequiredArgsConstructor
public class WebSocketAuthenticationHandler extends HttpSessionHandshakeInterceptor {
    private final JwtHelper _jwtHelper;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        Optional<Claims> claims = _jwtHelper.extractFromRequest(((ServletServerHttpRequest) request).getServletRequest());

        Stream.of(DISCORD_ID, USERNAME).forEach(tag -> attributes.put(tag, claims.filter(c -> c.containsKey(tag)).map(c -> (String) c.get(tag))));
        return super.beforeHandshake(request, response, wsHandler, attributes);
    }
}
