package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchReport;

import java.util.List;
import java.util.Optional;

public interface MatchReportRepository {
    Optional<MatchReport> findByMatchIdAndRound(String matchId, int round);

    List<MatchReport> findByMatchId(String matchId);

    void save(MatchReport report);

    void deleteByMatchId(String matchId);
}

