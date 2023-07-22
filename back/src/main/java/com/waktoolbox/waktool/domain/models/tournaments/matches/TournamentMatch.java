package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class TournamentMatch {
    String id;
    Instant date;
    boolean done;
    Integer pool;
    Integer phase;
    Integer round;
    String teamA;
    String teamB;
    List<TournamentMatchRound> rounds;
    String winner;
    String referee;
    String streamer;
}
