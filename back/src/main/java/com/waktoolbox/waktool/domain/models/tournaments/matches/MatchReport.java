package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class MatchReport {
    String matchId;
    int round;
    String tournamentId;
    String teamAReportedWinner;
    String teamAReporterId;
    String teamAScreenshot;
    String teamADisputeExplanation;
    String teamBReportedWinner;
    String teamBReporterId;
    String teamBScreenshot;
    String teamBDisputeExplanation;
    boolean disputed;
    Instant createdAt;
}

