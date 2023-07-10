package com.waktoolbox.waktool.infra.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TournamentMatchSpringDataRepository extends CrudRepository<TournamentMatchEntity, String> {

    List<TournamentMatchEntity> findAllMatchesByTournamentIdAndPhase(String tournamentId, int phase);

    @Query(value = "SELECT * FROM matches WHERE tournament_id = ?1 AND content->>'teamA' = ?2 OR content->>'teamB' = ?2", nativeQuery = true)
    List<TournamentMatchEntity> findAllMatchesByTournamentIdAndTeamId(String tournamentId, String teamId);
}
