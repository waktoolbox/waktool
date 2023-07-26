package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;

import java.util.List;

public interface TournamentPhaseRepository {
    void save(TournamentData tournamentData);

    List<TournamentData> getTournamentData(String tournamentId);

    int getMaxTournamentPhase(String tournamentId);
}
