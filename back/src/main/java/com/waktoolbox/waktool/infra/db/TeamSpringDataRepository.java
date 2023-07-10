package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.LightTeam;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamSpringDataRepository extends CrudRepository<TeamEntity, String> {

    @Query(value = """
                        SELECT COUNT(*) > 0
                        FROM teams t
                        WHERE id = :teamId AND t.content->>('leader') = :userId
            """, nativeQuery = true)
    boolean isTeamLeader(String teamId, String userId);

    @Query(value = """
                        SELECT COUNT(*) > 0
                        FROM teams t
                        WHERE t.content ->> ('tournament') = :tournamentId AND jsonb_exists_any(t.content->('validatedPlayers'), ARRAY[:userId])
            """, nativeQuery = true)
    boolean doesUserHasTeam(String tournamentId, String userId);

    @Query(value = """
                        SELECT *
                        FROM teams t
                        WHERE t.content ->> ('tournament') = :tournamentId AND jsonb_exists_any(t.content->('validatedPlayers'), ARRAY[:userId])
            """, nativeQuery = true)
    Optional<TeamEntity> getTeamWithValidatedUserForTournament(String tournamentId, String userId);

    @Query(value = """
                SELECT content->>('leader') as leader FROM teams WHERE id = :teamId
            """, nativeQuery = true)
    Optional<String> getTeamLeader(String teamId);

    @Query(value = """
                SELECT 
                    id,
                    content->>('name') as name,
                    content->>('server') as server,
                    content->('stats')->>('played') as played,
                    content->('stats')->>('victories') as victories
                    FROM teams
                    WHERE content->>('tournament') = :tournamentId AND content->>('displayOnTeamList') = 'true'
            """, nativeQuery = true)
    List<LightTeam> getPublicLightTournamentTeams(String tournamentId);

    @Query(value = """
                SELECT
                    id,
                    content->>('name') as name,
                    content->>('server') as server,
                    content->('stats')->>('played') as played,
                    content->('stats')->>('victories') as victories
                    FROM teams
                    WHERE content->>('tournament') = :tournamentId
            """, nativeQuery = true)
    List<LightTeam> getAllLightTournamentTeams(String tournamentId);

    @Query(value = """
                SELECT
                    id,
                    content->>('name') as name
                    FROM teams
                    WHERE content->>('tournament') = :tournamentId
                    AND id IN :teamIds
            """, nativeQuery = true)
    List<LightTeam> getTeamsNames(String tournamentId, List<String> teamIds);
}
