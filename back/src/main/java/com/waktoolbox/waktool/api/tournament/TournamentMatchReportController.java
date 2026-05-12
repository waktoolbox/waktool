package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.MatchReportsResponse;
import com.waktoolbox.waktool.api.models.ReportRoundResultRequest;
import com.waktoolbox.waktool.api.models.SuccessResponse;
import com.waktoolbox.waktool.domain.controllers.tournaments.MatchCompletionService;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentPhase;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchReport;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;
import com.waktoolbox.waktool.domain.repositories.MatchReportRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentMatchReportController {
    private final MatchCompletionService _matchCompletionService;
    private final MatchReportRepository _matchReportRepository;
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentRepository _tournamentRepository;
    private final TournamentTeamRepository _tournamentTeamRepository;

    @PostMapping("/tournaments/{tournamentId}/matches/{matchId}/rounds/{round}/report")
    public ResponseEntity<SuccessResponse> reportRoundResult(
            @RequestAttribute Optional<String> discordId,
            @PathVariable String tournamentId,
            @PathVariable String matchId,
            @PathVariable int round,
            @RequestBody ReportRoundResultRequest request
    ) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (request.winner() == null || request.winner().isBlank()) return ResponseEntity.ok(new SuccessResponse(false));

        // Screenshot is mandatory for reports — only allow null when an existing screenshot is already stored
        boolean isNewReport = _matchReportRepository.findByMatchIdAndRound(matchId, round).isEmpty();
        if (isNewReport && (request.screenshot() == null || request.screenshot().isBlank())) {
            return ResponseEntity.ok(new SuccessResponse(false));
        }

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        Tournament tournament = optTournament.get();

        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new SuccessResponse(false));
        if (match.isDone()) return ResponseEntity.ok(new SuccessResponse(false));

        // Check autoRefereeing is enabled on this phase
        TournamentPhase phase = findPhase(tournament, match.getPhase());
        if (phase == null || !phase.isEffectiveAutoRefereeing()) return ResponseEntity.ok(new SuccessResponse(false));

        // Validate winner is one of the two teams
        if (!request.winner().equals(match.getTeamA()) && !request.winner().equals(match.getTeamB())) {
            return ResponseEntity.ok(new SuccessResponse(false));
        }

        // Determine which team the caller belongs to
        String callerTeamSide = resolveCallerTeamSide(discordId.get(), match);
        if (callerTeamSide == null) return ResponseEntity.ok(new SuccessResponse(false));

        // Fetch or create the report row
        MatchReport report = _matchReportRepository.findByMatchIdAndRound(matchId, round)
                .orElseGet(() -> {
                    MatchReport r = new MatchReport();
                    r.setMatchId(matchId);
                    r.setRound(round);
                    r.setTournamentId(tournamentId);
                    r.setCreatedAt(Instant.now());
                    return r;
                });

        // Fill in the appropriate team columns — screenshot: null=keep existing, empty=clear, non-empty=update
        if ("A".equals(callerTeamSide)) {
            report.setTeamAReportedWinner(request.winner());
            report.setTeamAReporterId(discordId.get());
            if (request.screenshot() != null) report.setTeamAScreenshot(request.screenshot().isEmpty() ? null : request.screenshot());
            report.setTeamADisputeExplanation(request.disputeExplanation());
        } else {
            report.setTeamBReportedWinner(request.winner());
            report.setTeamBReporterId(discordId.get());
            if (request.screenshot() != null) report.setTeamBScreenshot(request.screenshot().isEmpty() ? null : request.screenshot());
            report.setTeamBDisputeExplanation(request.disputeExplanation());
        }

        // Auto-dispute detection: if both sides filled and they disagree
        if (report.getTeamAReportedWinner() != null && report.getTeamBReportedWinner() != null) {
            report.setDisputed(!report.getTeamAReportedWinner().equals(report.getTeamBReportedWinner()));
        }

        _matchReportRepository.save(report);

        // Auto-agreement: if both sides agree, set the round winner and clean up the report
        if (!report.isDisputed() && report.getTeamAReportedWinner() != null && report.getTeamBReportedWinner() != null) {
            Optional<TournamentMatchRound> optMatchRound = match.getRounds().stream()
                    .filter(r -> r.getRound() == round)
                    .findFirst();
            if (optMatchRound.isPresent()) {
                optMatchRound.get().setWinner(report.getTeamAReportedWinner());
                _tournamentMatchRepository.save(tournamentId, match);
                _matchReportRepository.deleteByMatchIdAndRound(matchId, round);

                // Try to auto-complete the match if enough rounds are won
                _matchCompletionService.tryAutoCompleteMatch(tournamentId, match);
            }
        }

        return ResponseEntity.ok(new SuccessResponse(true));
    }

    @GetMapping("/tournaments/{tournamentId}/matches/{matchId}/reports")
    public ResponseEntity<MatchReportsResponse> getMatchReports(
            @RequestAttribute Optional<String> discordId,
            @PathVariable String tournamentId,
            @PathVariable String matchId
    ) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new MatchReportsResponse(null));

        boolean isReferee = _tournamentRepository.isReferee(tournamentId, discordId.get());
        boolean isAdmin = _tournamentRepository.isAdmin(tournamentId, discordId.get());

        // Team members can also view reports (but screenshots are stripped)
        TournamentMatch match = _tournamentMatchRepository.getMatch(matchId);
        if (match == null) return ResponseEntity.ok(new MatchReportsResponse(null));

        String callerTeamSide = resolveCallerTeamSide(discordId.get(), match);
        boolean isTeamMember = callerTeamSide != null;

        if (!isReferee && !isAdmin && !isTeamMember) return ResponseEntity.ok(new MatchReportsResponse(null));

        List<MatchReport> reports = _matchReportRepository.findByMatchId(matchId);

        // Strip opponent screenshots for non-admin/non-referee (team members can see their own)
        if (!isReferee && !isAdmin) {
            final String side = callerTeamSide;
            reports = reports.stream().map(r -> {
                MatchReport stripped = new MatchReport();
                stripped.setMatchId(r.getMatchId());
                stripped.setRound(r.getRound());
                stripped.setTournamentId(r.getTournamentId());
                stripped.setTeamAReportedWinner(r.getTeamAReportedWinner());
                stripped.setTeamAReporterId(r.getTeamAReporterId());
                stripped.setTeamADisputeExplanation(r.getTeamADisputeExplanation());
                stripped.setTeamBReportedWinner(r.getTeamBReportedWinner());
                stripped.setTeamBReporterId(r.getTeamBReporterId());
                stripped.setTeamBDisputeExplanation(r.getTeamBDisputeExplanation());
                stripped.setDisputed(r.isDisputed());
                stripped.setCreatedAt(r.getCreatedAt());
                // Include the caller's own team screenshot
                if ("A".equals(side)) stripped.setTeamAScreenshot(r.getTeamAScreenshot());
                if ("B".equals(side)) stripped.setTeamBScreenshot(r.getTeamBScreenshot());
                return stripped;
            }).toList();
        }

        return ResponseEntity.ok(new MatchReportsResponse(reports));
    }

    /**
     * Returns "A" if the caller is a validated player of teamA, "B" for teamB, null otherwise.
     */
    private String resolveCallerTeamSide(String discordId, TournamentMatch match) {
        if (match.getTeamA() != null) {
            Optional<Team> optTeamA = _tournamentTeamRepository.getTeam(match.getTeamA());
            if (optTeamA.isPresent() && optTeamA.get().getValidatedPlayers().contains(discordId)) {
                return "A";
            }
        }

        if (match.getTeamB() != null) {
            Optional<Team> optTeamB = _tournamentTeamRepository.getTeam(match.getTeamB());
            if (optTeamB.isPresent() && optTeamB.get().getValidatedPlayers().contains(discordId)) {
                return "B";
            }
        }

        return null;
    }

    private TournamentPhase findPhase(Tournament tournament, int phaseNumber) {
        if (tournament.getPhases() == null) return null;
        return tournament.getPhases().stream()
                .filter(p -> p.getPhase() == phaseNumber)
                .findFirst()
                .orElse(null);
    }
}
