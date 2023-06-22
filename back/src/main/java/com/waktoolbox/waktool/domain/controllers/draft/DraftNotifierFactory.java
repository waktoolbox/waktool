package com.waktoolbox.waktool.domain.controllers.draft;

public interface DraftNotifierFactory {
    DraftNotifier create(String draftId);
}
