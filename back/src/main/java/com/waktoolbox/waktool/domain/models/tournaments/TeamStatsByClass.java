package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamStatsByClass {
    Integer id;
    Integer death;
    Integer banned;
    Integer killed;
    Integer played;
    Integer victories;
}
