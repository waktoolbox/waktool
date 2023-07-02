package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;
import com.waktoolbox.waktool.domain.models.tournaments.Tournament;

import java.util.Optional;

public interface TournamentRepository {
    boolean isTournamentStarted(String id);

    boolean isAdmin(String id, String user);

    LightTournament getFeaturedTournament();

    Optional<Tournament> getTournament(String id);
}
