package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.drafts.Draft;

public interface DraftRepository {
    Draft save(Draft draft);

    void delete(String id);

    Draft load(String id);
}
