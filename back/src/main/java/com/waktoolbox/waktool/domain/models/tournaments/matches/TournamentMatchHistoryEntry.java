package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;

import java.io.Serializable;

@Getter
public class TournamentMatchHistoryEntry implements Serializable {
    String team;
    Byte source;
    Byte target;
}
