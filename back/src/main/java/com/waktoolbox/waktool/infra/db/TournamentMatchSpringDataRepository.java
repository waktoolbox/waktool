package com.waktoolbox.waktool.infra.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.time.Instant;
import java.util.List;

public interface TournamentMatchSpringDataRepository extends CrudRepository<TournamentMatchEntity, String> {

    List<TournamentMatchEntity> findAllMatchesByTournamentIdAndPhase(String tournamentId, int phase);

    @Query(value = "SELECT * FROM matches WHERE tournament_id = ?1 AND content->>'done' = 'false'", nativeQuery = true)
    List<TournamentMatchEntity> findAllUndoneMatchesByTournamentId(String tournamentId);

    @Query(value = "SELECT * FROM matches WHERE tournament_id = ?1 AND (content->>'teamA' = ?2 OR content->>'teamB' = ?2)", nativeQuery = true)
    List<TournamentMatchEntity> findAllMatchesByTournamentIdAndTeamId(String tournamentId, String teamId);

    @Query(value = """
            SELECT COUNT(*) FROM matches
            WHERE tournament_id = :tournamentId
            AND phase = :phase
            AND content->>('round') = :round
            AND content->>('done') = 'false'
            """, nativeQuery = true)
    int countAllNotDoneMatchesByTournamentIdAndPhaseAndRound(String tournamentId, int phase, String round);

    @Query(value = """
            SELECT * FROM matches
            WHERE tournament_id = ?1
            AND (CASE WHEN content->>'date' ~ '^[0-9.]+$' THEN to_timestamp(CAST(content->>'date' AS double precision)) ELSE CAST(content->>'date' AS timestamp with time zone) END) >= ?2
            AND (CASE WHEN content->>'date' ~ '^[0-9.]+$' THEN to_timestamp(CAST(content->>'date' AS double precision)) ELSE CAST(content->>'date' AS timestamp with time zone) END) <= ?3
            """, nativeQuery = true)
    List<TournamentMatchEntity> getMatchesToNotify(String tournamentId, Instant minBound, Instant maxBound);
}
