package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.repositories.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TeamRepositoryImpl implements TeamRepository {
    private final TeamSpringDataRepository _repository;

    @Override
    public Optional<Team> getUserTeam(String tournamentId, String userId) {
        return _repository.getTeamWithValidatedUserForTournament(tournamentId, userId).map(TeamEntity::getContent);
    }
}
