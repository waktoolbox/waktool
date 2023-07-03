package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TournamentSpringDataRepository extends CrudRepository<TournamentEntity, String> {

    @Query(value = """
                SELECT coalesce(t.content->>('startDate'), '1970-01-01 00:00:01.000000')
                FROM tournaments t
                WHERE t.id = :id
            """, nativeQuery = true)
    String getRawTournamentStartDate(String id);

    @Query(value = """
                SELECT COUNT(*) FROM tournaments t
                WHERE t.id = :id AND jsonb_exists_any(t.content->('admins'), ARRAY[:user])
            """, nativeQuery = true)
    int isAdmin(String id, String user);

    @Query(value = """
                        SELECT id as id,
                            t.content->>('name') as name,
                            t.content->>('logo') as logo,
                            t.content->>('server') as server,
                            t.content->>('level') as level,
                            t.content->>('startDate') as startDate,
                            t.content->>('endDate') as endDate
                        FROM tournaments t
                        WHERE t.featured = true
            """, nativeQuery = true)
    LightTournament getFeaturedTournamentLight();

    @Query(value = "SELECT t.discordGuildId FROM TournamentEntity t WHERE t.id = :id")
    Optional<String> getDiscordGuildId(String id);
}
