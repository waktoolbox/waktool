package com.waktoolbox.waktool.infra.db;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamSpringDataRepository extends CrudRepository<TeamEntity, String> {

    @Query(value = """
                        SELECT *
                        FROM teams t
                        WHERE t.content ->> ('tournament') = :tournamentId AND jsonb_exists_any(t.content->('validatedPlayers'), ARRAY[:userId])
            """, nativeQuery = true)
    Optional<TeamEntity> getTeamWithValidatedUserForTournament(String tournamentId, String userId);
}
