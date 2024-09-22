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
    String discordLink;
    String level;
    Object rules;
    List<String> admins;
    List<TournamentPhase> phases;
    String server;
    Instant startDate;
    Instant endDate;
    Boolean mustRegisterTeamComposition;
    Object rewards;
    List<String> referees;
    String teamSize;
    List<String> streamers;
    String teamNumber;
    Object description;
}
