package com.waktoolbox.waktool.domain.models.tournaments;


import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Builder
public class TournamentData implements Serializable {
    String tournamentId;
    int phase;
    TournamentPhaseData content;
}
