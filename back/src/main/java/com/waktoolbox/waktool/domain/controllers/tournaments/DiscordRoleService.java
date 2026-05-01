package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.repositories.DiscordRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscordRoleService {
    private final Clock _clock;
    private final DiscordRepository _discordRepository;
    private final TournamentRepository _tournamentRepository;
    private final TournamentTeamRepository _tournamentTeamRepository;

    public boolean isFeatureActive(Tournament tournament, String discordGuildId) {
        if (tournament.getDiscordRoleStartDate() == null) return false;
        if (discordGuildId == null || discordGuildId.isBlank()) return false;
        Instant now = _clock.instant();
        return !now.isBefore(tournament.getDiscordRoleStartDate());
    }

    /**
     * Syncs the Discord role for a team: creates role if missing, assigns to all validated players.
     * Called when a player is accepted into a team (after discordRoleStartDate).
     */
    public void syncTeamRole(String tournamentId, Team team) {
        Optional<String> guildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        if (guildId.isEmpty()) return;

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return;

        Tournament tournament = optTournament.get();
        if (!isFeatureActive(tournament, guildId.get())) return;

        try {
            if (team.getDiscordRoleId() == null) {
                String roleId = _discordRepository.createRole(guildId.get(), team.getName());
                team.setDiscordRoleId(roleId);
                _tournamentTeamRepository.saveTeam(team);

                // Assign to all existing validated players
                for (String playerId : team.getValidatedPlayers()) {
                    try {
                        _discordRepository.assignRoleToUser(guildId.get(), playerId, roleId);
                    } catch (Exception e) {
                        log.warn("Failed to assign role {} to user {} in guild {}", roleId, playerId, guildId.get(), e);
                    }
                }
            } else {
                // Role already exists, assign to all validated players (idempotent)
                for (String playerId : team.getValidatedPlayers()) {
                    try {
                        _discordRepository.assignRoleToUser(guildId.get(), playerId, team.getDiscordRoleId());
                    } catch (Exception e) {
                        log.warn("Failed to assign role {} to user {} in guild {}", team.getDiscordRoleId(), playerId, guildId.get(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to sync Discord role for team {} in tournament {}", team.getId(), tournamentId, e);
        }
    }

    /**
     * Removes a single user from the team's Discord role.
     */
    public void removeUserFromTeamRole(String tournamentId, Team team, String userId) {
        Optional<String> guildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        if (guildId.isEmpty()) return;

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return;

        if (!isFeatureActive(optTournament.get(), guildId.get())) return;
        if (team.getDiscordRoleId() == null) return;

        try {
            _discordRepository.removeRoleFromUser(guildId.get(), userId, team.getDiscordRoleId());
        } catch (Exception e) {
            log.warn("Failed to remove role {} from user {} in guild {}", team.getDiscordRoleId(), userId, guildId.get(), e);
        }
    }

    /**
     * Deletes the Discord role for a team.
     */
    public void deleteTeamRole(String tournamentId, Team team) {
        Optional<String> guildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        if (guildId.isEmpty()) return;

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return;

        if (!isFeatureActive(optTournament.get(), guildId.get())) return;
        if (team.getDiscordRoleId() == null) return;

        try {
            _discordRepository.deleteRole(guildId.get(), team.getDiscordRoleId());
        } catch (Exception e) {
            log.warn("Failed to delete role {} in guild {}", team.getDiscordRoleId(), guildId.get(), e);
        }
    }

    /**
     * Recomputes all Discord roles for a tournament: creates missing roles,
     * syncs members, removes roles for deleted teams.
     * Runs asynchronously.
     */
    @Async
    public void syncAllTeamRoles(String tournamentId) {
        Optional<String> guildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        if (guildId.isEmpty()) return;

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return;

        Tournament tournament = optTournament.get();
        if (!isFeatureActive(tournament, guildId.get())) return;

        List<Team> teams = _tournamentTeamRepository.getTeamsByTournamentId(tournamentId);

        for (Team team : teams) {
            try {
                if (team.getDiscordRoleId() == null) {
                    String roleId = _discordRepository.createRole(guildId.get(), team.getName());
                    team.setDiscordRoleId(roleId);
                    _tournamentTeamRepository.saveTeam(team);
                }

                // Assign role to all validated players
                for (String playerId : team.getValidatedPlayers()) {
                    try {
                        _discordRepository.assignRoleToUser(guildId.get(), playerId, team.getDiscordRoleId());
                    } catch (Exception e) {
                        log.warn("Failed to assign role to user {} for team {}", playerId, team.getName(), e);
                    }
                }

                // Small delay to respect Discord rate limits
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Discord role sync interrupted for tournament {}", tournamentId);
                return;
            } catch (Exception e) {
                log.error("Failed to sync role for team {} in tournament {}", team.getName(), tournamentId, e);
            }
        }

        log.info("Discord role sync completed for tournament {} ({} teams)", tournamentId, teams.size());
    }
}

