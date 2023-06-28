package com.waktoolbox.waktool.domain.models.drafts;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Draft {
    String id;
    List<DraftAction> history = new ArrayList<>();
    DraftConfiguration configuration;
    List<DraftUser> teamA = new ArrayList<>();
    List<DraftUser> teamB = new ArrayList<>();
    List<DraftUser> users = new ArrayList<>();
    DraftTeamInfo teamAInfo;
    DraftTeamInfo teamBInfo;
    boolean teamAReady;
    boolean teamBReady;
    int currentAction;
}
