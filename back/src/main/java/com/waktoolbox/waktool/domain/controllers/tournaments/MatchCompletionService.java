package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentPhase;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentRoundModel;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;
import com.waktoolbox.waktool.domain.repositories.MatchReportRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;

import java.util.Optional;

/**
 * Shared service that checks whether a match should be auto-completed
 * after a round winner is determined (auto-agreement, dispute resolution, etc.).
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class MatchCompletionService {
    private final TournamentRepository _tournamentRepository;
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentStatsController _tournamentStatsController;
    private final MatchReportRepository _matchReportRepository;

    /**
     * Forces a match to complete with the given winner. Sets done=true, fills stats for both teams,
     * saves the match, and deletes any associated reports.
     */
    public void forceCompleteMatch(String tournamentId, TournamentMatch match, String winner) {
        match.setWinner(winner);
        match.setDone(true);

        if (match.getTeamA() != null) _tournamentStatsController.fillStats(match, match.getTeamA());
        if (match.getTeamB() != null) _tournamentStatsController.fillStats(match, match.getTeamB());
        _tournamentMatchRepository.save(tournamentId, match);
        _matchReportRepository.deleteByMatchId(match.getId());
    }

    /**
     * Checks if a team has won enough rounds to win the match.
     * If so, marks the match as done, fills stats, deletes remaining reports, and saves.
     *
     * @return true if the match was auto-completed
     */
    public boolean tryAutoCompleteMatch(String tournamentId, TournamentMatch match) {
        if (match.isDone()) return false;

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return false;
        Tournament tournament = optTournament.get();

        TournamentPhase phase = findPhase(tournament, match.getPhase());
        if (phase == null) return false;

        int bo = findBo(phase, match.getRound());
        int winsNeeded = (bo / 2) + 1;

        int teamAWins = 0;
        int teamBWins = 0;
        for (TournamentMatchRound round : match.getRounds()) {
            if (match.getTeamA().equals(round.getWinner())) teamAWins++;
            else if (match.getTeamB().equals(round.getWinner())) teamBWins++;
        }

        String winner = null;
        if (teamAWins >= winsNeeded) winner = match.getTeamA();
        else if (teamBWins >= winsNeeded) winner = match.getTeamB();

        if (winner == null) return false;

        log.info("Auto-completing match {} — winner: {}", match.getId(), winner);
        forceCompleteMatch(tournamentId, match, winner);

        return true;
    }

    private TournamentPhase findPhase(Tournament tournament, int phaseNumber) {
        if (tournament.getPhases() == null) return null;
        return tournament.getPhases().stream()
                .filter(p -> p.getPhase() == phaseNumber)
                .findFirst()
                .orElse(null);
    }

    private int findBo(TournamentPhase phase, int matchRound) {
        if (phase.getRoundModel() == null) return 1;
        for (TournamentRoundModel rm : phase.getRoundModel()) {
            if (rm.getRound() == matchRound) {
                return Math.max(rm.getBo(), 1);
            }
        }
        return 1;
    }
}

