package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.LightTeam;
import com.waktoolbox.waktool.domain.models.tournaments.Team;

import java.util.List;
import java.util.Optional;

public interface TournamentTeamRepository {
    boolean isTeamLeader(String id, String user);

    boolean doesUserHasTeam(String tournamentId, String userId);

    Optional<Team> getUserTeam(String tournamentId, String userId);

    Optional<Team> getTeam(String teamId);

    List<Team> getTeamsByTournamentId(String tournamentId);

    List<Team> getTeamsWithIds(List<String> teamIds);

    void saveTeam(Team team);

    Optional<String> getTeamLeader(String teamId);

    List<LightTeam> getPublicLightTournamentTeams(String tournamentId, boolean displayHidden);

    List<LightTeam> getTeamsNames(String tournamentId, List<String> teamIds);

    Team createTeam(Team team);

    void deleteTeam(String teamId);

}
