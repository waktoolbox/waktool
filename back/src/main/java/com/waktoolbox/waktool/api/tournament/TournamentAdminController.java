package com.waktoolbox.waktool.api.tournament;

import com.waktoolbox.waktool.api.models.SuccessResponse;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseController;
import com.waktoolbox.waktool.domain.controllers.tournaments.TournamentPhaseControllerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Validated
@Slf4j
public class TournamentAdminController {
    private final TournamentPhaseControllerFactory _phaseControllerFactory;

    @PostMapping("/tournaments/{tournamentId}/admin-go-to-next-phase")
    public ResponseEntity<SuccessResponse> goToNextPhase(@PathVariable String tournamentId) {
        TournamentPhaseController tournamentPhaseController = _phaseControllerFactory.get(tournamentId);
        if (tournamentPhaseController.hasANextRound()) {
            log.info("Trying to go the next round");
            return ResponseEntity.ok(new SuccessResponse(tournamentPhaseController.startNextRound()));
        }

        if (tournamentPhaseController.hasANextPhase()) {
            log.info("Trying to go the next phase");
            return ResponseEntity.ok(new SuccessResponse(tournamentPhaseController.startNextPhase()));
        }

        return ResponseEntity.ok(new SuccessResponse(false));
    }
}
