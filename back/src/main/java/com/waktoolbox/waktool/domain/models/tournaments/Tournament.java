package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class Tournament {
    String id;
    String logo;
    int[] maps;
    String name;
    String level;
    Object rules;
    List<String> admins;
    List<TournamentPhase> phases;
    String server;
    Instant endDate;
    Object rewards;
    List<String> referees;
    String teamSize;
    Instant startDate;
    List<String> streamers;
    String teamNumber;
    Object description;
}
