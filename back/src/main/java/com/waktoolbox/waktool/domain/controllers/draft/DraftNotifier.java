package com.waktoolbox.waktool.domain.controllers.draft;

import com.waktoolbox.waktool.domain.models.drafts.DraftAction;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeam;
import com.waktoolbox.waktool.domain.models.drafts.DraftUser;

public interface DraftNotifier {
    void onUserJoin(DraftUser user);

    void onUserAssigned(DraftUser user, DraftTeam team);

    void onAction(DraftAction action, int index);

    void onTeamReady(DraftTeam team, boolean ready);
}
