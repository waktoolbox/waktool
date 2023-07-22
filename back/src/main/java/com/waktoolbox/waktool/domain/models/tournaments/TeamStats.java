package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamStats {
    Integer played;
    Integer victories;
    TeamStatsByClass[] statsByClass;
}
