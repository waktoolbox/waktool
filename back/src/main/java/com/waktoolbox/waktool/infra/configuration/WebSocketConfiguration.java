package com.waktoolbox.waktool.infra.configuration;

import com.waktoolbox.waktool.infra.socket.SocketChannelInterceptor;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {
    private final SocketChannelInterceptor _socketChannelInterceptor;
    private final WebSocketAuthenticationHandler _webSocketAuthenticationHandler;
    private final ThreadPoolTaskScheduler _scheduler = new ThreadPoolTaskScheduler();

    @PostConstruct
    public void setup() {
        _scheduler.setPoolSize(1);
        _scheduler.setThreadNamePrefix("waktool-websocket-heartbeat-thread-");
        _scheduler.initialize();
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/socket")
                .setAllowedOrigins("*")
                .addInterceptors(_webSocketAuthenticationHandler);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic")
                .setHeartbeatValue(new long[]{25000, 5000})
                .setTaskScheduler(_scheduler);
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(_socketChannelInterceptor);
        WebSocketMessageBrokerConfigurer.super.configureClientInboundChannel(registration);
    }
}
