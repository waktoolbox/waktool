package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class TournamentPhaseDataTeam {
    String id;
    Integer lost; // lost matches
}
