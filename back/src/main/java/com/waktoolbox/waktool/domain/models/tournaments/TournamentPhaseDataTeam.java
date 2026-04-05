package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@AllArgsConstructor
@Getter
@Setter
public class TournamentPhaseDataTeam implements Serializable {
    String id;
    List<Byte> breeds;
    Integer lost; // lost matches
}
