package com.waktoolbox.waktool.domain.models.draft;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
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
