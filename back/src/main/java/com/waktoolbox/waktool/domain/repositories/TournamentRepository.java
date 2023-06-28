package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.LightTournament;

public interface TournamentRepository {
    LightTournament getFeaturedTournament();
}
