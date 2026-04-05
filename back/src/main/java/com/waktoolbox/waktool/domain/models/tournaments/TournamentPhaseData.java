package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class TournamentPhaseData implements Serializable {
    List<TournamentPhaseDataTeam> teams;
    List<String> matches;
    List<TournamentPhaseDataTeamPool> teamPool;

    int currentRound;
}
