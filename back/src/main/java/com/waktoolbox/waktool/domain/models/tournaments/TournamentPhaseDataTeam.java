package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
public class TournamentPhaseDataTeam {
    String id;
    List<Byte> breeds;
    Integer lost; // lost matches
}
