package com.waktoolbox.waktool.api.tournament;

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

    @PostMapping("/tournaments/{tournamentId}/admin-go-to-next-phase")
    public ResponseEntity<Void> goToNextPhase(@PathVariable String tournamentId) {
        log.info("Trying to go the next phase");
        return null;
    }
}
