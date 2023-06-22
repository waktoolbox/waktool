package com.waktoolbox.waktool.domain.models.users;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserDisconnectedEvent extends ApplicationEvent {
    private final User user;

    public UserDisconnectedEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
}
