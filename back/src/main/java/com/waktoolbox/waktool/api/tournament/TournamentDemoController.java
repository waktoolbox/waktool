package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.SuccessResponse;
import com.waktoolbox.waktool.domain.controllers.tournaments.DemoActionService;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class TournamentDemoController {
    private final TournamentRepository _tournamentRepository;
    private final DemoActionService _demoActionService;

    @PostMapping("/tournaments/{tournamentId}/demo/{actionKey}")
    public ResponseEntity<SuccessResponse> executeDemoAction(
            @RequestAttribute Optional<String> discordId,
            @PathVariable String tournamentId,
            @PathVariable String actionKey
    ) {
        if (discordId.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));
        if (!_tournamentRepository.isAdmin(tournamentId, discordId.get()))
            return ResponseEntity.ok(new SuccessResponse(false));

        Optional<Tournament> optTournament = _tournamentRepository.getTournament(tournamentId);
        if (optTournament.isEmpty()) return ResponseEntity.ok(new SuccessResponse(false));

        Tournament tournament = optTournament.get();
        if (tournament.getDemo() == null || !tournament.getDemo().containsKey(actionKey))
            return ResponseEntity.ok(new SuccessResponse(false));

        boolean success = _demoActionService.execute(tournament.getDemo().get(actionKey), tournamentId);
        return ResponseEntity.ok(new SuccessResponse(success));
    }
}

