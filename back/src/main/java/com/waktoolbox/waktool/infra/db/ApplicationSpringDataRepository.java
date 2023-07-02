package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.DisplayableApplication;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationSpringDataRepository extends CrudRepository<ApplicationEntity, String> {

    @Query(value = """
            SELECT a.id, ac.id as user_id, ac.global_name as username
            FROM applications a
            JOIN accounts ac ON ac.id = a.user_id
            WHERE a.team_id = :teamId
            """, nativeQuery = true)
    List<DisplayableApplication> findAllByTeamId(String teamId);

    ApplicationEntity findByTournamentIdAndUserIdAndTeamId(String tournamentId, String userId, String teamId);

    @Transactional
    void deleteAllByTournamentIdAndUserId(String tournamentId, String userId);

    @Transactional
    void deleteByTournamentIdAndTeamIdAndId(String tournamentId, String teamId, String id);
}
