package com.waktoolbox.waktool.infra.db;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchType;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TournamentMatchRepositoryImpl implements TournamentMatchRepository {
    private final TournamentMatchSpringDataRepository _repository;

    @Override
    public List<TournamentMatch> getMatches(String tournamentId, MatchesSearchParameters parameters) {
        boolean done = parameters.getType() == MatchesSearchType.RESULTS;
        // Sorry, I'm exhausted, I spent too much time here trying to debug this shit before noticing I was testing
        // the request on my migration database rather than my runtime database. Why is this a problem, you maybe will
        // ask ? BECAUSE IT WAS EMPTY AND I LOST SOMETHING LIKE AN ENTIRE HOUR THINKING IT WASN'T.
        return _repository.findAllMatchesByTournamentIdAndPhase(tournamentId, parameters.getPhase()).stream()
                .map(TournamentMatchEntity::getContent)
                .filter(e -> e.isDone() == done)
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getDate()).orElse(Instant.ofEpochMilli(0))))
                .toList();
    }

    @Override
    public List<TournamentMatch> getTeamMatches(String tournamentId, String teamId) {
        return _repository.findAllMatchesByTournamentIdAndTeamId(tournamentId, teamId).stream()
                .map(TournamentMatchEntity::getContent)
                .sorted(Comparator.comparing(t -> Optional.ofNullable(t.getDate()).orElse(Instant.ofEpochMilli(0))))
                .toList();
    }

    @Override
    public TournamentMatch getMatch(String matchId) {
        return _repository.findById(matchId).map(TournamentMatchEntity::getContent).orElse(null);
    }
}
