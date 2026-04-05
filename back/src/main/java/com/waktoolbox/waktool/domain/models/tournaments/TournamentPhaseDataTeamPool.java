package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class TournamentPhaseDataTeamPool implements Serializable {
    List<String> teams;
    List<String> matches;
}
