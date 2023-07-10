package com.waktoolbox.waktool.domain.models.tournaments;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TournamentData {
    String tournamentId;
    int phase;
    TournamentPhaseData content;
}
