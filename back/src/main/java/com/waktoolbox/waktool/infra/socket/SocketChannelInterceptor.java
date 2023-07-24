package com.waktoolbox.waktool.infra.socket;

import com.waktoolbox.waktool.domain.models.users.User;
import com.waktoolbox.waktool.domain.models.users.UserConnectedEvent;
import com.waktoolbox.waktool.domain.models.users.UserDisconnectedEvent;
import com.waktoolbox.waktool.domain.models.users.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.ApplicationEventMulticaster;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;

@Component
@Slf4j
@RequiredArgsConstructor
public class SocketChannelInterceptor implements ChannelInterceptor {
    private static final Function<StompHeaderAccessor, String> WRAPPER_TO_SIMP_ID = (wrapper) -> wrapper.getMessageHeaders().get("simpSessionId", String.class);
    private static final Function<StompHeaderAccessor, User> MESSAGE_TO_USER = (wrapper) -> {
        Optional<Object> optAttributes = Optional.ofNullable(wrapper.getHeader("simpSessionAttributes"));
        if (optAttributes.isEmpty()) return new User(UserType.ANONYMOUS_USER, WRAPPER_TO_SIMP_ID.apply(wrapper));
        return optAttributes.filter(ConcurrentHashMap.class::isInstance)
                .map(a -> (ConcurrentHashMap<?, ?>) a)
                .map(a -> a.get(DISCORD_ID))
                .filter(a -> a instanceof Optional b && b.isPresent())
                .map(a -> (Optional<String>) a)
                .map(Optional::get)
                .map(discordId -> new User(UserType.DISCORD_USER, discordId))
                .orElse(new User(UserType.ANONYMOUS_USER, WRAPPER_TO_SIMP_ID.apply(wrapper)));
    };

    private final ApplicationEventMulticaster _eventPublisher;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor wrapper = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (wrapper.getCommand() == null) return ChannelInterceptor.super.preSend(message, channel);

        switch (wrapper.getCommand()) {
            case CONNECT ->
                    _eventPublisher.multicastEvent(new UserConnectedEvent(this, MESSAGE_TO_USER.apply(wrapper)));
            case DISCONNECT ->
                    _eventPublisher.multicastEvent(new UserDisconnectedEvent(this, MESSAGE_TO_USER.apply(wrapper)));
        }

        return ChannelInterceptor.super.preSend(message, channel);
    }

}
