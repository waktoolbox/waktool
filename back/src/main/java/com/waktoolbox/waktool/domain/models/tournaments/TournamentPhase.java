package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class TournamentPhase implements Serializable {
    int phase;
    int poolSize;
    int phaseType;
    int poolNumber;
    TournamentRoundModel[] roundModel;
}
