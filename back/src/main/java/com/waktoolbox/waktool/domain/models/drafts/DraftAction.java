package com.waktoolbox.waktool.domain.models.drafts;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DraftAction implements Serializable {
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
