package com.waktoolbox.waktool.utils;

import lombok.Getter;

@Getter
public enum TranslatorKey {
    MAP("map.%s"),
    TOURNAMENT_USER_APPLIED("tournament.user.applied"),
    TOURNAMENT_USER_APPLICATION_ACCEPTED("tournament.user.application.accepted"),
    ;

    final String key;

    TranslatorKey(String key) {
        this.key = key;
    }
}
