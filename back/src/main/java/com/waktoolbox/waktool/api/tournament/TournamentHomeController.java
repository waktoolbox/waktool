package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.TournamentHomeResponse;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
public class TournamentHomeController {
    private final TournamentRepository _tournamentRepository;

    @GetMapping("/tournament/home")
    public TournamentHomeResponse getTournamentHome() {
        return new TournamentHomeResponse(_tournamentRepository.getFeaturedTournament());
    }
}
