package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;

import java.util.List;

@Getter
public class TournamentMatchHistory {
    int turns;
    List<String> players;
    List<TournamentMatchHistoryEntry> entries;
}
