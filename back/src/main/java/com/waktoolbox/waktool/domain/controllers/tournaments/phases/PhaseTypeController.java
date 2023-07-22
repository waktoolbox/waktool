package com.waktoolbox.waktool.domain.controllers.tournaments.phases;

import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerContext;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class PhaseTypeController {
    protected final TournamentPhaseControllerContext context;

    public abstract boolean initPhase();

    public abstract boolean startNextRound();
}
