package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentPhaseRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TournamentPhaseControllerFactory {
    private final TournamentRepository _tournamentRepository;
    private final TournamentMatchRepository _tournamentMatchRepository;
    private final TournamentPhaseRepository _tournamentPhaseRepository;
    private final TournamentTeamRepository _tournamentTeamRepository;

    public TournamentPhaseController get(String tournamentId) {
        TournamentPhaseControllerContext.TournamentPhaseControllerContextBuilder contextBuilder = TournamentPhaseControllerContext.builder()
                .tournamentMatchRepository(_tournamentMatchRepository)
                .tournamentPhaseRepository(_tournamentPhaseRepository)
                .tournamentTeamRepository(_tournamentTeamRepository);

        return _tournamentRepository.getTournament(tournamentId)
                .map(tournament -> new TournamentPhaseController(contextBuilder.tournament(tournament).build()))
                .orElse(null);
    }
}
