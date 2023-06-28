package com.waktoolbox.waktool.domain.models.drafts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftAction {
    DraftTeam team;
    DraftActionType type;
    Byte breed;
    boolean lockForPickingTeam;
    boolean lockForOpponentTeam;

    public DraftAction(DraftTeam team, DraftActionType type, boolean lockForPicking, boolean lockForOpponent) {
        this.team = team;
        this.type = type;
        this.lockForPickingTeam = lockForPicking;
        this.lockForOpponentTeam = lockForOpponent;
    }
}
