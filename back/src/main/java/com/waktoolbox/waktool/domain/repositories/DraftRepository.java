package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.draft.Draft;

public interface DraftRepository {
    Draft save(Draft draft);

    Draft load(String id);
}
