package com.waktoolbox.waktool.infra.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TournamentPhaseSpringDataRepository extends CrudRepository<TournamentPhaseEntity, TournamentPhaseEntity.TournamentPhaseId> {
    List<TournamentPhaseEntity> findAllByIdTournamentId(String tournamentId);

    @Query(value = "SELECT coalesce(MAX(phase), 0) FROM tournaments_data WHERE tournament_id = :tournamentId", nativeQuery = true)
    int getMaxPhaseByIdTournamentId(String tournamentId);
}
