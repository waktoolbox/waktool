package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;

@Getter
public class TournamentMatchHistoryEntry {
    String team;
    Byte source;
    Byte target;
}
