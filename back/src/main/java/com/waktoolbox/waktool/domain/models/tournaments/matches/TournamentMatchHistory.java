package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TournamentMatchHistory {
    int turns;
    List<String> players;
    List<TournamentMatchHistoryEntry> entries;
}
