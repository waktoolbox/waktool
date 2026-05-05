package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.matches.MatchReport;

import java.util.List;

public record DisputesResponse(List<MatchReport> disputes) {
}

