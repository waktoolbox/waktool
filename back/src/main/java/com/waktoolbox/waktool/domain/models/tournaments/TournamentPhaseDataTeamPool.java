package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TournamentPhaseDataTeamPool {
    List<String> teams;
    List<String> matches;
}
