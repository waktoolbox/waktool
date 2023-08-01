package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.models.Breeds;
import com.waktoolbox.waktool.domain.models.drafts.DraftTeamResult;
import com.waktoolbox.waktool.domain.models.tournaments.Team;
import com.waktoolbox.waktool.domain.models.tournaments.TeamStats;
import com.waktoolbox.waktool.domain.models.tournaments.TeamStatsByClass;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchHistory;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchRound;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Controller
public class TournamentStatsController {
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentTeamRepository _tournamentTeamRepository;

    public void fillStats(TournamentMatch match, String team) {
        _tournamentTeamRepository.getTeam(team).ifPresent(t -> fillStats(match, t));
    }

    private void fillStats(TournamentMatch match, Team team) {
        if (team.getStats() == null) {
            team.setStats(new TeamStats());
        }
        TeamStats stats = team.getStats();
        stats.setPlayed(Optional.ofNullable(stats.getPlayed()).orElse(0) + 1);
        boolean isWinner = team.getId().equals(match.getWinner());
        stats.setVictories(Optional.ofNullable(stats.getVictories()).orElse(0) + (isWinner ? 1 : 0));

        if (stats.getStatsByClass() == null) stats.setStatsByClass(new TeamStatsByClass[Breeds.MAX_BREED_ID + 1]);
        TeamStatsByClass[] statsByClass = stats.getStatsByClass();
        if (stats.getPlayedByPlayer() == null) stats.setPlayedByPlayer(new HashMap<>());
        Map<String, Integer> playedByPlayer = stats.getPlayedByPlayer();

        for (TournamentMatchRound round : match.getRounds()) {
            manageDraftResultStats(team, isWinner, statsByClass, match, round);
            manageRoundHistoryStats(team, statsByClass, playedByPlayer, round);
        }
        _tournamentTeamRepository.saveTeam(team);
    }

    public void recomputeStats(String tournamentId) {
        List<Team> teams = _tournamentTeamRepository.getTeamsByTournamentId(tournamentId);
        teams.forEach(team -> {
            team.setStats(null);
            _tournamentMatchRepository.getTeamMatches(tournamentId, team.getId()).forEach(match -> fillStats(match, team));
            _tournamentTeamRepository.saveTeam(team);
        });
    }

    private static void manageDraftResultStats(Team team, boolean isWinner, TeamStatsByClass[] statsByClass, TournamentMatch match, TournamentMatchRound round) {
        DraftTeamResult draftResult = team.getId().equals(match.getTeamA()) ? round.getTeamADraft() : round.getTeamBDraft();
        if (draftResult != null) {
            for (Byte pickedClass : draftResult.getPickedClasses()) {
                TeamStatsByClass breedStats = getTeamStatsByClass(statsByClass, pickedClass);
                breedStats.setPlayed(Optional.ofNullable(breedStats.getPlayed()).orElse(0) + 1);

                if (isWinner) {
                    breedStats.setVictories(Optional.ofNullable(breedStats.getVictories()).orElse(0) + 1);
                }
            }

            for (Byte bannedClass : draftResult.getBannedClasses()) {
                TeamStatsByClass breedStats = getTeamStatsByClass(statsByClass, bannedClass);
                breedStats.setBanned(Optional.ofNullable(breedStats.getPlayed()).orElse(0) + 1);
            }
        }
    }

    private static void manageRoundHistoryStats(Team team, TeamStatsByClass[] statsByClass, Map<String, Integer> playedByPlayer, TournamentMatchRound round) {
        if (round.getHistory() == null) return;
        TournamentMatchHistory history = round.getHistory();
        if (history.getPlayers() != null) {
            history.getPlayers().forEach(p -> playedByPlayer.compute(p, (k, v) -> v == null ? 1 : v + 1));
        }
        if (history.getEntries() != null) {
            history.getEntries().forEach(entry -> {
                if (team.getId().equals(entry.getTeam())) {
                    TeamStatsByClass breedStats = getTeamStatsByClass(statsByClass, entry.getSource());
                    breedStats.setKilled(Optional.ofNullable(breedStats.getKilled()).orElse(0) + 1);
                    return;
                }

                TeamStatsByClass breedStats = getTeamStatsByClass(statsByClass, entry.getTarget());
                breedStats.setDeath(Optional.ofNullable(breedStats.getDeath()).orElse(0) + 1);
            });
        }
    }

    private static TeamStatsByClass getTeamStatsByClass(TeamStatsByClass[] statsByClass, Byte targetClass) {
        if (statsByClass[targetClass] == null) {
            statsByClass[targetClass] = new TeamStatsByClass();
            statsByClass[targetClass].setId(targetClass);
        }
        return statsByClass[targetClass];
    }
}
