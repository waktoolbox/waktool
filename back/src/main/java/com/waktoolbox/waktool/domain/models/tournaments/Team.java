package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Team {
    String id;
    String name;
    String leader;
    String server;
    List<String> players;
    String tournament;
    String catchPhrase;
    boolean displayOnTeamList;
    List<String> validatedPlayers;
}
