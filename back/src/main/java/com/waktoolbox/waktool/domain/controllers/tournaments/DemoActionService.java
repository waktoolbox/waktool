package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.repositories.DemoActionRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.function.Consumer;

@Service
@Slf4j
public class DemoActionService {
    private static final Random RANDOM = new SecureRandom();
    private final Map<String, Consumer<String>> _actions;

    public DemoActionService(
            DemoActionRepository demoActionRepository,
            TournamentMatchRepository tournamentMatchRepository,
            MatchCompletionService matchCompletionService
    ) {
        _actions = Map.of(
                "TOURNAMENT_START", tournamentId ->
                        demoActionRepository.executeSqlFile("classpath:db/demo/" + tournamentId + "-start.sql"),
                "RESET", tournamentId ->
                        demoActionRepository.executeSqlFile("classpath:db/demo/" + tournamentId + "-reset.sql"),
                "TEAM_A_WIN", tournamentId ->
                        forceWinAllPendingMatches(tournamentId, "A", tournamentMatchRepository, matchCompletionService),
                "TEAM_B_WIN", tournamentId ->
                        forceWinAllPendingMatches(tournamentId, "B", tournamentMatchRepository, matchCompletionService),
                "RANDOM_TEAM_WIN", tournamentId ->
                        forceWinAllPendingMatches(tournamentId, "RANDOM", tournamentMatchRepository, matchCompletionService)
        );
    }

    public boolean execute(String actionKey, String tournamentId) {
        Consumer<String> action = _actions.get(actionKey);
        if (action == null) {
            log.warn("Unknown demo action: {} for tournament: {}", actionKey, tournamentId);
            return false;
        }

        log.info("Executing demo action: {} for tournament: {}", actionKey, tournamentId);
        action.accept(tournamentId);
        return true;
    }

    public boolean isValidAction(String actionKey) {
        return _actions.containsKey(actionKey);
    }

    private static void forceWinAllPendingMatches(
            String tournamentId,
            String side,
            TournamentMatchRepository matchRepository,
            MatchCompletionService matchCompletionService
    ) {
        List<TournamentMatch> undoneMatches = matchRepository.getAllUndoneMatches(tournamentId);

        log.info("Force-winning {} pending matches for tournament {} (side: {})", undoneMatches.size(), tournamentId, side);

        for (TournamentMatch match : undoneMatches) {
            if (match.isDone()) continue;
            if (match.getTeamA() == null && match.getTeamB() == null) continue;

            String winner;
            if (match.getTeamA() == null) {
                winner = match.getTeamB();
            } else if (match.getTeamB() == null) {
                winner = match.getTeamA();
            } else {
                winner = switch (side) {
                    case "A" -> match.getTeamA();
                    case "B" -> match.getTeamB();
                    default -> RANDOM.nextBoolean() ? match.getTeamA() : match.getTeamB();
                };
            }

            matchCompletionService.forceCompleteMatch(tournamentId, match, winner);
        }
    }
}

