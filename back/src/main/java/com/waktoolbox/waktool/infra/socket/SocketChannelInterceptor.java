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

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import static com.waktoolbox.waktool.utils.JwtHelper.DISCORD_ID;

@Component
@Slf4j
@RequiredArgsConstructor
public class SocketChannelInterceptor implements ChannelInterceptor {
    private static final Function<StompHeaderAccessor, String> WRAPPER_TO_SIMP_ID = (wrapper) -> wrapper.getMessageHeaders().get("simpSessionId", String.class);

    private static final Function<StompHeaderAccessor, User> MESSAGE_TO_USER = (wrapper) -> {
        Optional<Object> optAttributes = Optional.ofNullable(wrapper.getSessionAttributes());
        if (optAttributes.isEmpty() || !(optAttributes.get() instanceof Map<?, ?> attributes)) {
            return new User(UserType.ANONYMOUS_USER, WRAPPER_TO_SIMP_ID.apply(wrapper));
        }

        if (attributes.get(DISCORD_ID) instanceof Optional<?> opt && opt.isPresent()) {
            return new User(UserType.DISCORD_USER, (String) opt.get());
        }

        if (attributes.get("guest-id") instanceof Optional<?> opt && opt.isPresent()) {
            return new User(UserType.ANONYMOUS_USER, (String) opt.get());
        }

        return new User(UserType.ANONYMOUS_USER, WRAPPER_TO_SIMP_ID.apply(wrapper));
    };

    private final ApplicationEventMulticaster _eventPublisher;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor wrapper = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (wrapper == null || wrapper.getCommand() == null) return ChannelInterceptor.super.preSend(message, channel);

        if (wrapper.getCommand() == org.springframework.messaging.simp.stomp.StompCommand.CONNECT) {
            java.util.List<String> guestIds = wrapper.getNativeHeader("guest-id");
            if (guestIds != null && !guestIds.isEmpty() && wrapper.getSessionAttributes() != null) {
                wrapper.getSessionAttributes().put("guest-id", Optional.of(guestIds.get(0)));
            }
        }

        switch (wrapper.getCommand()) {
            case CONNECT ->
                    _eventPublisher.multicastEvent(new UserConnectedEvent(this, MESSAGE_TO_USER.apply(wrapper)));
            case DISCONNECT ->
                    _eventPublisher.multicastEvent(new UserDisconnectedEvent(this, MESSAGE_TO_USER.apply(wrapper)));
        }

        return ChannelInterceptor.super.preSend(message, channel);
    }

}
