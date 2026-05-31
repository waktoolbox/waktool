package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchReport;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MatchReportRepository {
    Optional<MatchReport> findByMatchIdAndRound(String matchId, int round);

    List<MatchReport> findByMatchId(String matchId);

    List<MatchReport> findDisputedByTournamentId(String tournamentId);

    Set<String> findMatchIdsWithReports(String tournamentId);

    void save(MatchReport report);

    void deleteByMatchId(String matchId);

    void deleteByMatchIdAndRound(String matchId, int round);
}

