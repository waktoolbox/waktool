package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Map;

@Getter
@Setter
public class TeamStats implements Serializable {
    Integer played;
    Integer victories;
    TeamStatsByClass[] statsByClass;
    Map<String, Integer> playedByPlayer;
}
