package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class TeamStats {
    Integer played;
    Integer victories;
    TeamStatsByClass[] statsByClass;
    Map<String, Integer> playedByPlayer;
}
