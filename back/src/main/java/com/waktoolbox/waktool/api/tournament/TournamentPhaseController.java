package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.GetPhasesResponse;
import com.waktoolbox.waktool.domain.repositories.TournamentPhaseRepository;
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
public class TournamentPhaseController {
    private final TournamentPhaseRepository _phaseRepository;

    @GetMapping("/tournaments/{tournamentId}/phases")
    public GetPhasesResponse getPhases(@PathVariable String tournamentId) {
        return new GetPhasesResponse(_phaseRepository.getMaxTournamentPhase(tournamentId));
    }
}
