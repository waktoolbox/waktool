package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Getter
@Setter
public class TournamentMatchHistory implements Serializable {
    int turns;
    List<String> players;
    List<TournamentMatchHistoryEntry> entries;
}
