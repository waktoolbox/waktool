package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.TournamentResponse;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentController {
    private final TournamentRepository _tournamentRepository;

    @GetMapping("/tournaments/{tournamentId}")
    public TournamentResponse getTournament(@PathVariable String tournamentId) {
        if (tournamentId == null) return null;
        return new TournamentResponse(_tournamentRepository.getTournament(tournamentId).orElse(null));
    }

}
