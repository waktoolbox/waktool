package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.utils.TranslatorKey;

public interface NotificationRepository {
    void notifyUser(String userId, TranslatorKey key, Object... args);

    void notifyUser(String userId, String key, Object... args);
}
