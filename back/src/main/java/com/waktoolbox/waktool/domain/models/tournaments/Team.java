package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class Team {
    String id;
    String name;
    String leader;
    String server;
    Set<String> players;
    String tournament;
    String catchPhrase;
    boolean displayOnTeamList;
    Set<String> validatedPlayers;
}
