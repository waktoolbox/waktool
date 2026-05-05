package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.TournamentPhaseData;

import java.util.List;

public record TournamentStandingsResponse(List<TournamentPhaseData> phases) {
}
