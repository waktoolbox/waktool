package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.LightTeamListResponse;
import com.waktoolbox.waktool.api.models.TeamResponse;
import com.waktoolbox.waktool.api.models.TournamentResponse;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.repositories.TeamRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentController {
    private final TeamRepository _teamRepository;
    private final TournamentRepository _tournamentRepository;

    @GetMapping("/tournaments/{tournamentId}")
    public TournamentResponse getTournament(@PathVariable String tournamentId) {
        if (tournamentId == null) return null;
        return new TournamentResponse(_tournamentRepository.getTournament(tournamentId).orElse(null));
    }

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
    public TeamResponse createTeam(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @RequestBody Team requestTeam) {
        if (discordId.isEmpty()) return null;
        if (tournamentId == null) return null;
        String leader = discordId.get();
        if (_teamRepository.getUserTeam(tournamentId, leader).isPresent()) return null;

        // TODO optimize to avoid full load for a date check
        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return null;
        Tournament tournament = optTournament.get();
        if (tournament.getStartDate().isBefore(Instant.now())) return null;

        Team team = new Team();
        team.setTournament(tournamentId);
        team.setName(requestTeam.getName());
        team.setServer(requestTeam.getServer());
        team.setCatchPhrase(requestTeam.getCatchPhrase());
        team.setLeader(leader);
        team.setDisplayOnTeamList(requestTeam.isDisplayOnTeamList());
        team.setValidatedPlayers(new HashSet<>());

        team.getValidatedPlayers().add(leader);

        return new TeamResponse(_teamRepository.createTeam(team));
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
}
