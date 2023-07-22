package com.waktoolbox.waktool.domain.controllers.tournaments;

import com.waktoolbox.waktool.domain.models.tournaments.Tournament;
import com.waktoolbox.waktool.domain.models.tournaments.TournamentData;
import com.waktoolbox.waktool.domain.repositories.TournamentMatchRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentPhaseRepository;
import com.waktoolbox.waktool.domain.repositories.TournamentTeamRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.List;

@Accessors(prefix = "_")
@Builder(toBuilder = true)
@Getter
@Setter
public class TournamentPhaseControllerContext {
    Tournament _tournament;
    int _phase;
    List<TournamentData> _tournamentData;
    TournamentMatchRepository _tournamentMatchRepository;
    TournamentPhaseRepository _tournamentPhaseRepository;
    TournamentTeamRepository _tournamentTeamRepository;
}
