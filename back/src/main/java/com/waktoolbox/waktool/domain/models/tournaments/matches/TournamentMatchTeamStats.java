package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class TournamentMatchTeamStats implements Serializable {
    String turns;
    String[] killedBreeds;
    String[] killerBreeds;
}
