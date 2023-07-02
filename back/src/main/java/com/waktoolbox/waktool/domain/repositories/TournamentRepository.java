package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;

import java.util.Optional;

public interface TournamentRepository {
    LightTournament getFeaturedTournament();

    Optional<Tournament> getTournament(String id);
}
