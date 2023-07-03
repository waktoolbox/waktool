package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.Team;

public record PostTeamResponse(boolean success, String error, Team team) {
}
