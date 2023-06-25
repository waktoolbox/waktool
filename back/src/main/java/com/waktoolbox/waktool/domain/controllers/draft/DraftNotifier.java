package com.waktoolbox.waktool.domain.controllers.draft;

import com.waktoolbox.waktool.domain.models.draft.DraftAction;
import com.waktoolbox.waktool.domain.models.draft.DraftTeam;
import com.waktoolbox.waktool.domain.models.draft.DraftUser;

public interface DraftNotifier {
    void onUserJoin(DraftUser user);

    void onUserAssigned(DraftUser user, DraftTeam team);

    void onAction(DraftAction action, int index);

    void onTeamReady(DraftTeam team, boolean ready);
}
