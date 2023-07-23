package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.DraftIdResponse;
import com.waktoolbox.waktool.api.models.MatchListResponse;
import com.waktoolbox.waktool.api.models.MatchResponse;
import com.waktoolbox.waktool.api.models.UserStartDraftRequest;
import com.waktoolbox.waktool.domain.controllers.draft.DraftManager;
import com.waktoolbox.waktool.domain.models.Account;
import com.waktoolbox.waktool.domain.models.drafts.*;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;
import com.waktoolbox.waktool.domain.repositories.AccountRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentMatchController {
    private final AccountRepository _accountRepository;
    private final DraftManager _draftManager;
    private final TournamentMatchRepository _repository;
    private final TournamentTeamRepository _teamRepository;

    @PostMapping("/tournaments/{tournamentId}/matches-search")
    public MatchListResponse postMatchesSearch(@PathVariable String tournamentId, @RequestBody MatchesSearchParameters body) {
        return new MatchListResponse(_repository.getMatches(tournamentId, body));
    }

    @GetMapping("/tournaments/{tournamentId}/matches/{matchId}")
    public MatchResponse postMatchesSearch(@PathVariable String matchId) {
        return new MatchResponse(_repository.getMatch(matchId));
    }

    @GetMapping("/tournaments/{tournamentId}/teams/{teamId}/matches")
    public MatchListResponse postMatchesSearch(@PathVariable String tournamentId, @PathVariable String teamId) {
        return new MatchListResponse(_repository.getTeamMatches(tournamentId, teamId));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/user-start-draft")
    public ResponseEntity<DraftIdResponse> postUserStartDraft(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @PathVariable int round, @RequestBody UserStartDraftRequest userStartDraftRequest) {
        String draftId = String.format("%s_%s", matchId, round);
        if (_draftManager.hasDraft(draftId)) {
            return ResponseEntity.ok(new DraftIdResponse(draftId));
        }

        if (discordId.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        TournamentMatch match = _repository.getMatch(matchId);
        if (match == null) return ResponseEntity.notFound().build();
        if (match.getDate() == null) return ResponseEntity.badRequest().build();

        Optional<TournamentMatchRound> optRound = match.getRounds().stream().filter(r -> r.getRound() == round).findFirst();
        if (optRound.isEmpty()) return ResponseEntity.notFound().build();

        TournamentMatchRound matchRound = optRound.get();
        if (matchRound.getTeamADraft() != null) return ResponseEntity.badRequest().build();
        if (matchRound.getDraftDate() != null && matchRound.getDraftDate().isAfter(Instant.now()))
            return ResponseEntity.badRequest().build();

        return processDraftCreation(tournamentId, discordId, userStartDraftRequest, match, matchRound);
    }

    private ResponseEntity<DraftIdResponse> processDraftCreation(String tournamentId, Optional<String> discordId, UserStartDraftRequest userStartDraftRequest, TournamentMatch match, TournamentMatchRound matchRound) {
        Team teamA;
        Team teamB;
        if (userStartDraftRequest.team() != null) {
            String draftFirstPicker = matchRound.getDraftFirstPicker();

            Optional<Team> optFirstPickerTeam = _teamRepository.getTeam(draftFirstPicker);
            if (optFirstPickerTeam.isEmpty()) return ResponseEntity.badRequest().build();

            Team firstPickerTeam = optFirstPickerTeam.get();
            if (!firstPickerTeam.getValidatedPlayers().contains(discordId.get()))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            if (userStartDraftRequest.team() == DraftTeam.TEAM_A) {
                teamA = firstPickerTeam;
                teamB = _teamRepository.getTeam(match.getTeamB()).orElse(null);
            } else {
                teamA = _teamRepository.getTeam(match.getTeamA()).orElse(null);
                teamB = firstPickerTeam;
            }
        } else {
            teamA = _teamRepository.getTeam(match.getTeamA()).orElse(null);
            teamB = _teamRepository.getTeam(match.getTeamB()).orElse(null);
        }

        if (teamA == null || teamB == null) return ResponseEntity.badRequest().build();

        DraftConfiguration configuration = new DraftConfiguration();
        configuration.setProvidedByServer(true);
        // TODO late pass through config
        configuration.setActions(DraftDefaultModels.WAKFU_WARRIORS.getActions());

        Draft draft = new Draft();
        draft.setId(matchRound.getDraftId());
        draft.setConfiguration(configuration);
        draft.setTeamAInfo(new DraftTeamInfo(teamA.getId(), teamA.getName()));
        draft.setTeamBInfo(new DraftTeamInfo(teamB.getId(), teamB.getName()));

        draft.setTeamA(_accountRepository.find(teamA.getValidatedPlayers()).stream().map(account -> toDraftUser(account, teamA)).toList());
        draft.setTeamB(_accountRepository.find(teamB.getValidatedPlayers()).stream().map(account -> toDraftUser(account, teamB)).toList());

        _draftManager.createDraftByServer(draft);

        matchRound.setDraftDate(Instant.now());
        _repository.save(tournamentId, match);

        return ResponseEntity.ok(new DraftIdResponse(draft.getId()));
    }

    private DraftUser toDraftUser(Account account, Team team) {
        DraftUser draftUser = new DraftUser();
        draftUser.setId(account.getId());
        draftUser.setDisplayName(account.getGlobalName());
        draftUser.setCaptain(team.getLeader().equals(account.getId()));
        return draftUser;
    }
}
