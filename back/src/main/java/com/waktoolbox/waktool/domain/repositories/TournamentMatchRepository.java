package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;

import java.util.List;

public interface TournamentMatchRepository {
    List<TournamentMatch> getMatches(String tournamentId, MatchesSearchParameters parameters);


    List<TournamentMatch> getTeamMatches(String tournamentId, String teamId);

    TournamentMatch getMatch(String matchId);
}
