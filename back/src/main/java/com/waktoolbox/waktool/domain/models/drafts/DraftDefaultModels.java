package com.waktoolbox.waktool.domain.models.drafts;

import static com.waktoolbox.waktool.domain.models.drafts.DraftActionType.BAN;
import static com.waktoolbox.waktool.domain.models.drafts.DraftActionType.PICK;
import static com.waktoolbox.waktool.domain.models.drafts.DraftTeam.TEAM_A;
import static com.waktoolbox.waktool.domain.models.drafts.DraftTeam.TEAM_B;

public enum DraftDefaultModels {
    WAKFU_WARRIORS() {
        @Override
        public DraftAction[] getActions() {
            return new DraftAction[]{
                    new DraftAction(TEAM_A, BAN, true, true),
                    new DraftAction(TEAM_B, BAN, true, true),
                    new DraftAction(TEAM_A, PICK, true, true),
                    new DraftAction(TEAM_B, PICK, true, true),
                    new DraftAction(TEAM_B, BAN, true, true),
                    new DraftAction(TEAM_A, BAN, true, true),
                    new DraftAction(TEAM_B, PICK, true, true),
                    new DraftAction(TEAM_A, PICK, true, true),
                    new DraftAction(TEAM_A, BAN, true, true),
                    new DraftAction(TEAM_B, BAN, true, true),
                    new DraftAction(TEAM_A, PICK, true, true),
                    new DraftAction(TEAM_B, PICK, true, true),
                    new DraftAction(TEAM_A, PICK, true, false),
                    new DraftAction(TEAM_B, PICK, true, false),
                    new DraftAction(TEAM_A, PICK, true, false),
                    new DraftAction(TEAM_B, PICK, true, false),
                    new DraftAction(TEAM_A, PICK, true, false),
                    new DraftAction(TEAM_B, PICK, true, false),
            };
        }
    };

    public abstract DraftAction[] getActions();
}
