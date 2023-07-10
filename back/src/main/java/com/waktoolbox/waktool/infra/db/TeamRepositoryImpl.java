package com.waktoolbox.waktool.infra.db;


import com.waktoolbox.waktool.domain.models.tournaments.LightTeam;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.repositories.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TeamRepositoryImpl implements TeamRepository {
    private final TeamSpringDataRepository _repository;

    @Override
    public boolean isTeamLeader(String id, String user) {
        return _repository.isTeamLeader(id, user);
    }

    @Override
    public boolean doesUserHasTeam(String tournamentId, String userId) {
        return _repository.doesUserHasTeam(tournamentId, userId);
    }

    @Override
    public Optional<Team> getUserTeam(String tournamentId, String userId) {
        return _repository.getTeamWithValidatedUserForTournament(tournamentId, userId).map(TeamEntity::getContent);
    }

    @Override
    public List<LightTeam> getPublicLightTournamentTeams(String tournamentId, boolean displayHidden) {
        return displayHidden ? _repository.getAllLightTournamentTeams(tournamentId) : _repository.getPublicLightTournamentTeams(tournamentId);
    }

    @Override
    public List<LightTeam> getTeamsNames(String tournamentId, List<String> teamIds) {
        return _repository.getTeamsNames(tournamentId, teamIds);
    }

    @Override
    public Optional<Team> getTeam(String teamId) {
        return _repository.findById(teamId).map(TeamEntity::getContent);
    }

    @Override
    public void saveTeam(Team team) {
        _repository.findById(team.getId())
                .map(t -> {
                    t.setContent(team);
                    return t;
                }).ifPresent(_repository::save);
    }

    @Override
    public Optional<String> getTeamLeader(String teamId) {
        return _repository.getTeamLeader(teamId);
    }

    @Override
    public Team createTeam(Team team) {
        TeamEntity teamEntity = new TeamEntity();
        teamEntity.setId(UUID.randomUUID().toString());
        team.setId(teamEntity.getId());
        teamEntity.setContent(team);
        teamEntity.setCreatedAt(Instant.now());
        TeamEntity savedTeam = _repository.save(teamEntity);
        return savedTeam.getContent();
    }

    @Override
    public void deleteTeam(String teamId) {
        _repository.deleteById(teamId);
    }
}
