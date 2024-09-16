package com.waktoolbox.waktool.domain.controllers.tournaments.phases;

import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseController;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseType;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PhaseTypeControllerFactory {

    public static PhaseTypeController get(TournamentPhaseType phaseType, TournamentPhaseController tpc) {
        return switch (phaseType) {
            case NONE -> throw new IllegalStateException("Phase type is NONE");
            case WAKFU_WARRIORS_ROUND_ROBIN ->
                    throw new IllegalArgumentException("Sorry, this phase type is not implemented yet (WAKFU_WARRIORS_ROUND_ROBIN)");
            case WAKFU_WARRIORS_BRACKET_TOURNAMENT ->
                    throw new IllegalArgumentException("Sorry, this phase type is not implemented yet (WAKFU_WARRIORS_BRACKET_TOURNAMENT)");
            case WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT ->
                    new WWDoubleEliminationPhaseController(tpc.getContext());
        };
    }
}
