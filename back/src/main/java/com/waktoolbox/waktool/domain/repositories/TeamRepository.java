package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.LightTeam;
import com.waktoolbox.waktool.domain.models.tournaments.Team;

import java.util.List;
import java.util.Optional;

public interface TeamRepository {
    boolean isTeamLeader(String id, String user);

    Optional<Team> getUserTeam(String tournamentId, String userId);

    Optional<Team> getTeam(String teamId);

    void saveTeam(Team team);

    Optional<String> getTeamLeader(String teamId);

    List<LightTeam> getPublicLightTournamentTeams(String tournamentId);

    Team createTeam(Team team);
}
