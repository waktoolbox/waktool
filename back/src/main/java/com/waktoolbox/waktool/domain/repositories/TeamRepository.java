package com.waktoolbox.waktool.domain.repositories;

import com.waktoolbox.waktool.domain.models.tournaments.Team;

import java.util.Optional;

public interface TeamRepository {
    Optional<Team> getUserTeam(String tournamentId, String userId);
}
