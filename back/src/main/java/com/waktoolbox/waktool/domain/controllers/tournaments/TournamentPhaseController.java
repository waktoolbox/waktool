package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.controllers.tournaments.phases.PhaseTypeController;
import com.waktoolbox.waktool.domain.controllers.tournaments.phases.PhaseTypeControllerFactory;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentPhase;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentRoundModel;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@AllArgsConstructor
@Getter
public class TournamentPhaseController {
    private TournamentPhaseControllerContext context;

    public boolean hasANextPhase() {
        List<TournamentPhase> phases = context.getTournament().getPhases();
        List<TournamentData> tournamentPhaseData = getTournamentData();
        if (tournamentPhaseData.isEmpty() && !phases.isEmpty()) return true; // before first phase, need init

        int currentMaxPhase = tournamentPhaseData.stream().map(TournamentData::getPhase).max(Integer::compareTo).orElse(0);
        if (phases.size() < currentMaxPhase - 1) return false; // should not happen, current is greater than last phase
        return currentMaxPhase < phases.size(); // there is at least one more phase
    }

    public boolean hasANextRound() {
        List<TournamentData> tournamentPhaseData = getTournamentData();
        if (tournamentPhaseData.isEmpty()) return false; // no phase defined, should have started before
        int currentMaxPhase = tournamentPhaseData.stream().map(TournamentData::getPhase).max(Integer::compareTo).orElse(0);
        TournamentData currentPhaseData = tournamentPhaseData.get(currentMaxPhase - 1);
        int currentRound = currentPhaseData.getContent().getCurrentRound();
        if (currentRound == 0) return true; // before first round, need init

        TournamentRoundModel[] roundModel = context.getTournament().getPhases().get(Math.max(0, currentMaxPhase - 1)).getRoundModel();
        return currentRound < roundModel.length; // if current round is less than the number of rounds there is remaining rounds
    }

    public boolean startNextPhase() {
        int currentMaxPhase = getCurrentPhase();
        context.setPhase(currentMaxPhase);
        TournamentPhase phase = context.getTournament().getPhases().get(currentMaxPhase);

        PhaseTypeController phaseTypeController = createPhaseTypeController(phase);
        phaseTypeController.initPhase();
        return startNextRound();
    }

    public boolean startNextRound() {
        int currentMaxPhase = getCurrentPhase();
        context.setPhase(currentMaxPhase);
        TournamentPhase phase = context.getTournament().getPhases().get(currentMaxPhase);
        PhaseTypeController phaseTypeController = createPhaseTypeController(phase);
        return phaseTypeController.startNextRound();
    }

    private PhaseTypeController createPhaseTypeController(TournamentPhase phase) {
        return PhaseTypeControllerFactory.get(TournamentPhaseType.fromTypeIndex(phase.getPhaseType()), this);
    }

    public int getCurrentPhase() {
        List<TournamentData> tournamentPhaseData = getTournamentData();
        return tournamentPhaseData.stream().map(TournamentData::getPhase).max(Integer::compareTo).orElse(0);
    }

    public List<TournamentData> getTournamentData() {
        if (context.getTournamentData() == null) {
            List<TournamentData> tournamentData = new ArrayList<>(context.getTournamentPhaseRepository().getTournamentData(context.getTournament().getId()));
            tournamentData.sort(Comparator.comparingInt(TournamentData::getPhase));
            context.setTournamentData(tournamentData);
        }
        return context.getTournamentData();
    }
}
