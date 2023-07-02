package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.TeamResponse;
import com.waktoolbox.waktool.api.models.TournamentResponse;
import com.waktoolbox.waktool.domain.repositories.TeamRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
}
