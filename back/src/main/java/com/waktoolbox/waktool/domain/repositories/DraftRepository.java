package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.drafts.Draft;

public interface DraftRepository {
    boolean exists(String id);

    Draft save(Draft draft);

    void delete(String id);

    Draft load(String id);
}
