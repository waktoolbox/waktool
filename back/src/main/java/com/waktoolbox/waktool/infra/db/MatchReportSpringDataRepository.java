package com.waktoolbox.waktool.infra.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MatchReportSpringDataRepository extends CrudRepository<MatchReportEntity, MatchReportEntity.MatchReportId> {

    List<MatchReportEntity> findAllByMatchId(String matchId);

    List<MatchReportEntity> findAllByTournamentIdAndDisputedTrue(String tournamentId);

    Optional<MatchReportEntity> findByMatchIdAndRound(String matchId, int round);

    @Query("SELECT DISTINCT e.matchId FROM MatchReportEntity e WHERE e.tournamentId = :tournamentId")
    Set<String> findDistinctMatchIdsByTournamentId(String tournamentId);

    void deleteAllByMatchId(String matchId);

    void deleteByMatchIdAndRound(String matchId, int round);
}

