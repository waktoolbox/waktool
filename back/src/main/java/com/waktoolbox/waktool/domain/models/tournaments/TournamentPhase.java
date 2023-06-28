package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TournamentPhase {
    int phase;
    int poolSize;
    int phaseType;
    int poolNumber;
    TournamentRoundModel[] roundModel;
}
