package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.*;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.repositories.ApplicationRepository;
import com.waktoolbox.waktool.domain.repositories.DiscordRepository;
import com.waktoolbox.waktool.domain.repositories.TeamRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Objects;
import java.util.Optional;

// TODO refactor to move logic to domain

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentTeamController {
    private final ApplicationRepository _applicationRepository;
    private final DiscordRepository _discordRepository;
    private final TeamRepository _teamRepository;
    private final TournamentRepository _tournamentRepository;

    @GetMapping("/tournaments/{tournamentId}/my-team")
    public TeamResponse getMyTeam(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId) {
        if (discordId.isEmpty()) return null;
        if (tournamentId == null) return null;
        return new TeamResponse(_teamRepository.getUserTeam(tournamentId, discordId.get()).orElse(null));
    }

    @GetMapping("/tournaments/{tournamentId}/teams/{teamId}")
    public TeamResponse getTeam(@RequestAttribute Optional<String> discordId, @PathVariable String teamId) {
        if (discordId.isEmpty()) return null;
        if (teamId == null) return null;
        return new TeamResponse(_teamRepository.getTeam(teamId).orElse(null));
    }

    @GetMapping("/tournaments/{tournamentId}/teams")
    public LightTeamListResponse getTeamList(@PathVariable String tournamentId) {
        return new LightTeamListResponse(_teamRepository.getPublicLightTournamentTeams(tournamentId));
    }

    @PostMapping("/tournaments/{tournamentId}/teams")
    public PostTeamResponse createTeam(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @RequestBody Team requestTeam) {
        if (discordId.isEmpty()) return new PostTeamResponse(false, null, null);
        if (tournamentId == null) return new PostTeamResponse(false, null, null);
        String leader = discordId.get();
        if (_teamRepository.getUserTeam(tournamentId, leader).isPresent())
            return new PostTeamResponse(false, null, null);
        if (_tournamentRepository.isTournamentStarted(tournamentId)) return new PostTeamResponse(false, null, null);

        Optional<String> discordGuildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        String userId = discordId.get();
        if (discordGuildId.isPresent() && (!_discordRepository.isGuildMember(discordGuildId.get(), userId))) {
            return new PostTeamResponse(false, "error.mustBeOnDiscordToCreateTeam", null);
        }

        Team team = new Team();
        team.setTournament(tournamentId);
        team.setName(requestTeam.getName());
        team.setServer(requestTeam.getServer());
        team.setCatchPhrase(requestTeam.getCatchPhrase());
        team.setLeader(leader);
        team.setDisplayOnTeamList(requestTeam.isDisplayOnTeamList());
        team.setValidatedPlayers(new ArrayList<>());

        team.getValidatedPlayers().add(leader);

        Team createdTeam = _teamRepository.createTeam(team);

        _applicationRepository.deleteUserApplications(tournamentId, leader);

        return new PostTeamResponse(true, null, createdTeam);
    }

    @PutMapping("/tournaments/{tournamentId}/teams/{teamId}")
    public ResponseEntity<Void> updateTeam(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId, @RequestBody Team requestTeam) {
        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (tournamentId == null) return ResponseEntity.badRequest().build();

        Optional<Team> optTeam = _teamRepository.getTeam(teamId);
        if (optTeam.isEmpty()) return ResponseEntity.badRequest().build();

        Team team = optTeam.get();
        if (!Objects.equals(team.getTournament(), tournamentId)) return ResponseEntity.badRequest().build();

        String leader = discordId.get();
        boolean isTeamLeader = _teamRepository.isTeamLeader(teamId, leader);
        boolean isAdmin = _tournamentRepository.isAdmin(tournamentId, leader);
        if (!isTeamLeader && !isAdmin) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean tournamentStarted = _tournamentRepository.isTournamentStarted(tournamentId);

        if (isAdmin) {
            team.setName(requestTeam.getName());
        }

        if (!tournamentStarted || isAdmin) {
            team.setDisplayOnTeamList(requestTeam.isDisplayOnTeamList());
        }

        team.setCatchPhrase(requestTeam.getCatchPhrase());
        team.setServer(requestTeam.getServer());

        _teamRepository.saveTeam(team);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tournaments/{tournamentId}/teams/{teamId}/applications")
    public PendingApplicationsResponse getApplications(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId) {
        if (discordId.isEmpty()) return null;
        if (tournamentId == null) return null;
        if (teamId == null) return null;
        String userId = discordId.get();
        if (!_teamRepository.isTeamLeader(teamId, userId) && !_tournamentRepository.isAdmin(tournamentId, userId))
            return null;

        return new PendingApplicationsResponse(_applicationRepository.findPendingApplicationsForTeam(teamId));
    }

    @GetMapping("/tournaments/{tournamentId}/teams/{teamId}/my-application")
    public MyApplicationResponse getMyApplication(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId) {
        if (discordId.isEmpty()) return new MyApplicationResponse(true);
        if (tournamentId == null) return new MyApplicationResponse(true);
        if (teamId == null) return new MyApplicationResponse(true);
        String userId = discordId.get();
        if (_teamRepository.doesUserHasTeam(tournamentId, userId)) return new MyApplicationResponse(true);

        return new MyApplicationResponse(_applicationRepository.doesThisApplicationExist(tournamentId, teamId, userId));
    }

    @PostMapping("/tournaments/{tournamentId}/teams/{teamId}/applications")
    public PostApplicationResponse createApplication(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId) {
        if (discordId.isEmpty()) return new PostApplicationResponse(false, null);
        if (tournamentId == null) return new PostApplicationResponse(false, null);
        if (teamId == null) return new PostApplicationResponse(false, null);
        if (_tournamentRepository.isTournamentStarted(tournamentId)) return new PostApplicationResponse(false, null);

        Optional<String> discordGuildId = _tournamentRepository.getDiscordGuildId(tournamentId);
        String userId = discordId.get();
        if (discordGuildId.isPresent() && (!_discordRepository.isGuildMember(discordGuildId.get(), userId))) {
            return new PostApplicationResponse(false, "error.mustBeOnDiscordToJoinTournament");
        }

        _applicationRepository.saveApplication(tournamentId, teamId, userId);
        return new PostApplicationResponse(true, null);
    }

    @PostMapping("/tournaments/{tournamentId}/teams/{teamId}/applications/{applicationId}")
    public ResponseEntity<Void> acceptApplication(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId, @PathVariable String applicationId) {
        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (tournamentId == null) return ResponseEntity.badRequest().build();
        if (teamId == null) return ResponseEntity.badRequest().build();
        if (_tournamentRepository.isTournamentStarted(tournamentId)) return ResponseEntity.badRequest().build();
        String userId = discordId.get();

        Optional<String> applicationUserId = _applicationRepository.getApplicationUserId(applicationId);
        if (applicationUserId.isEmpty()) return ResponseEntity.badRequest().build();

        Optional<Team> optTeam = _teamRepository.getTeam(teamId);
        if (!optTeam.isPresent()) return ResponseEntity.badRequest().build();
        Team team = optTeam.get();

        if (!Objects.equals(team.getLeader(), userId) && !_tournamentRepository.isAdmin(tournamentId, userId))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        team.getValidatedPlayers().add(applicationUserId.get());
        _teamRepository.saveTeam(team);
        _applicationRepository.deleteApplication(tournamentId, teamId, applicationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tournaments/{tournamentId}/teams/{teamId}/applications/{applicationId}")
    public ResponseEntity<Void> deleteApplication(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId, @PathVariable String applicationId) {
        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (tournamentId == null) return ResponseEntity.badRequest().build();
        if (teamId == null) return ResponseEntity.badRequest().build();
        if (applicationId == null) return ResponseEntity.badRequest().build();

        if (!_applicationRepository.doesApplicationExist(applicationId)) return ResponseEntity.badRequest().build();
        if (!_teamRepository.isTeamLeader(teamId, discordId.get()) && !_tournamentRepository.isAdmin(tournamentId, discordId.get()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        _applicationRepository.deleteApplication(tournamentId, teamId, applicationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tournaments/{tournamentId}/teams/{teamId}/players/{playerId}")
    public ResponseEntity<Void> deletePlayer(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId, @PathVariable String playerId) {
        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (tournamentId == null) return ResponseEntity.badRequest().build();
        if (teamId == null) return ResponseEntity.badRequest().build();
        if (playerId == null) return ResponseEntity.badRequest().build();

        Optional<Team> optTeam = _teamRepository.getTeam(teamId);
        if (optTeam.isEmpty()) return ResponseEntity.badRequest().build();

        String userId = discordId.get();
        if (!_teamRepository.isTeamLeader(teamId, userId) && !_tournamentRepository.isAdmin(tournamentId, userId))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Team team = optTeam.get();
        team.getValidatedPlayers().remove(playerId);
        _teamRepository.saveTeam(team);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tournaments/{tournamentId}/teams/{teamId}")
    public ResponseEntity<Void> deleteTeam(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String teamId) {
        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (tournamentId == null) return ResponseEntity.badRequest().build();
        if (teamId == null) return ResponseEntity.badRequest().build();
        String userId = discordId.get();
        if (!_tournamentRepository.isAdmin(tournamentId, userId))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        _teamRepository.deleteTeam(teamId);

        return ResponseEntity.ok().build();
    }
}
