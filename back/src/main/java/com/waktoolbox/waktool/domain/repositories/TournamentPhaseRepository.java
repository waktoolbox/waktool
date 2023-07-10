package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;

import java.util.List;

public interface TournamentPhaseRepository {
    public List<TournamentData> getTournamentData(String tournamentId);

    public int getMaxTournamentPhase(String tournamentId);
}
