package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.*;
import com.waktoolbox.waktool.domain.controllers.draft.DraftManager;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseController;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerFactory;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentStatsController;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchHistory;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;
import com.waktoolbox.waktool.domain.repositories.DraftRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
@Slf4j
public class TournamentAdminController {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DraftManager _draftManager;
    private final DraftRepository _draftRepository;
    private final TournamentRepository _tournamentRepository;
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentPhaseControllerFactory _phaseControllerFactory;
    private final TournamentStatsController _tournamentStatsController;

    @PostMapping("/tournaments/{tournamentId}/admin-go-to-next-phase")
    public ResponseEntity<SuccessResponse> goToNextPhase(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (!_tournamentRepository.isAdmin(tournamentId, discordId.get()))
            return ResponseEntity.ok(new SuccessResponse(false));

        TournamentPhaseController tournamentPhaseController = _phaseControllerFactory.get(tournamentId);
        if (tournamentPhaseController.hasANextRound()) {
            log.info("Trying to go the next round");
            return ResponseEntity.ok(new SuccessResponse(tournamentPhaseController.startNextRound()));
        }

        if (tournamentPhaseController.hasANextPhase()) {
            log.info("Trying to go the next phase");
            return ResponseEntity.ok(new SuccessResponse(tournamentPhaseController.startNextPhase()));
        }

        return ResponseEntity.ok(new SuccessResponse(false));
    }

    @PostMapping("/tournaments/{tournamentId}/admin-recompute-stats")
    public ResponseEntity<SuccessResponse> adminRecomputeTeamStats(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (!_tournamentRepository.isAdmin(tournamentId, discordId.get()))
            return ResponseEntity.ok(new SuccessResponse(false));

        _tournamentStatsController.recomputeStats(tournamentId);

        return ResponseEntity.ok(new SuccessResponse(false));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/set-me-as-streamer")
    public ResponseEntity<SuccessResponse> postSetMeAsStreamer(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (!_tournamentRepository.isStreamer(tournamentId, discordId.get()))
            return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));
        if (match.getStreamer() != null) return ResponseEntity.ok(new SuccessResponse(false));

        match.setStreamer(discordId.get());
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/remove-streamer")
    public ResponseEntity<SuccessResponse> postRemoveStreamer(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        boolean isReferee = _tournamentRepository.isReferee(tournamentId, discordId.get());
        boolean isStreamer = _tournamentRepository.isStreamer(tournamentId, discordId.get());
        if (!isReferee && !isStreamer) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));
        if (!isReferee && !discordId.get().equals(match.getStreamer()))
            return ResponseEntity.ok(new SuccessResponse(false));

        match.setStreamer(null);
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/set-me-as-referee")
    public ResponseEntity<SuccessResponse> postSetMeAsReferee(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        match.setReferee(discordId.get());
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/referee-set-match-date")
    public ResponseEntity<SuccessResponse> postSetMatchDate(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @RequestBody AdminMatchDateRequest matchDateRequest) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        match.setDate(Instant.parse(matchDateRequest.date()));
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/referee-validate-match-result")
    public ResponseEntity<SuccessResponse> postSetMatchResult(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @RequestBody RefereeValidateMatchResultRequest matchResultRequest) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        if (matchResultRequest.winner() == null || matchResultRequest.winner().isBlank())
            return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));
        if (match.isDone()) return ResponseEntity.ok(new SuccessResponse(false));

        match.setWinner(matchResultRequest.winner());
        match.setDone(true);

        _tournamentStatsController.fillStats(match, match.getTeamA());
        _tournamentStatsController.fillStats(match, match.getTeamB());
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/referee-reroll-map")
    public ResponseEntity<SuccessResponse> postRefereeRerollMap(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @PathVariable int round) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (!_tournamentRepository.isReferee(tournamentId, discordId.get()))
            return ResponseEntity.ok(new SuccessResponse(false));

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        Tournament tournament = optTournament.get();

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        Optional<TournamentMatchRound> optMatchRound = match.getRounds().stream().filter(r -> r.getRound() == round).findFirst();
        if (optMatchRound.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));

        int[] maps = tournament.getMaps();
        optMatchRound.get().setMap(maps[RANDOM.nextInt(maps.length)]);
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/referee-reset-draft")
    public ResponseEntity<SuccessResponse> postRefereeResetDraft(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @PathVariable int round) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        Optional<TournamentMatchRound> optMatchRound = match.getRounds().stream().filter(r -> r.getRound() == round).findFirst();
        if (optMatchRound.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatchRound matchRound = optMatchRound.get();
        matchRound.setDraftDate(null);
        matchRound.setTeamADraft(null);
        matchRound.setTeamBDraft(null);

        _draftRepository.delete(matchRound.getDraftId());
        _draftManager.removeDraft(matchRound.getDraftId());

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/referee-send-stats")
    public ResponseEntity<SuccessResponse> postRefereeSendStats(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @PathVariable int round, @RequestBody RefereeSendMatchStatsRequest statsRequest) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        Optional<TournamentMatchRound> optMatchRound = match.getRounds().stream().filter(r -> r.getRound() == round).findFirst();
        if (optMatchRound.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatchRound matchRound = optMatchRound.get();
        TournamentMatchHistory history = statsRequest.history();
        if (history.getEntries() != null) {
            history.setEntries(
                    history.getEntries().stream()
                            .filter(h -> h.getSource() != null && h.getTarget() != null && h.getTeam() != null)
                            .toList()
            );
        }
        matchRound.setHistory(history);
        matchRound.setWinner(statsRequest.winner());
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/referee-draft-first-picker")
    public ResponseEntity<SuccessResponse> postRefereeDraftFirstPicker(@RequestAttribute Optional<String> discordId, @PathVariable String tournamentId, @PathVariable String matchId, @PathVariable int round, @RequestBody RefereeDraftFirstPickerRequest draftFirstPickerRequest) {
        if (!isReferee(tournamentId, discordId)) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));

        Optional<TournamentMatchRound> optMatchRound = match.getRounds().stream().filter(r -> r.getRound() == round).findFirst();
        if (optMatchRound.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));

        TournamentMatchRound matchRound = optMatchRound.get();
        String team = switch (draftFirstPickerRequest.team()) {
            case TEAM_A -> match.getTeamA();
            case TEAM_B -> match.getTeamB();
            default -> null;
        };
        matchRound.setDraftFirstPicker(team);
        _tournamentMatchRepository.save(tournamentId, match);

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    private boolean isReferee(String tournamentId, Optional<String> discordId) {
        return discordId.filter(s -> _tournamentRepository.isReferee(tournamentId, s)).isPresent();
    }
}
