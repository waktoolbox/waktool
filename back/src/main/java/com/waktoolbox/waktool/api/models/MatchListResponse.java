package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatch;

import java.util.List;

public record MatchListResponse(List<TournamentMatch> matches) {
}
