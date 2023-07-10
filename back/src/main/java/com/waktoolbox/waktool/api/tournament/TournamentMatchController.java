package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.MatchListResponse;
import com.waktoolbox.waktool.api.models.MatchResponse;
import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchesSearchParameters;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentMatchController {
    private final TournamentMatchRepository _repository;

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
}
