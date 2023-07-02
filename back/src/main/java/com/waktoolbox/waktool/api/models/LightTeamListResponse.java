package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.LightTeam;

import java.util.List;

public record LightTeamListResponse(List<LightTeam> teams) {
}
