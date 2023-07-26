package com.waktoolbox.waktool.api.models;

import com.waktoolbox.waktool.domain.models.tournaments.matches.TournamentMatchHistory;

public record RefereeSendMatchStatsRequest(TournamentMatchHistory history, String winner) {
}
