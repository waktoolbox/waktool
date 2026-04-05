package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class TeamStatsByClass implements Serializable {
    Byte id;
    Integer death;
    Integer banned;
    Integer killed;
    Integer played;
    Integer victories;
}
