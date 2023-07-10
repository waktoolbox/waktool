package com.waktoolbox.waktool.domain.models.tournaments.matches;

import com.waktoolbox.waktool.domain.models.drafts.DraftTeamResult;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class TournamentMatchRound {
    int map;
    int round;
    String draftId;
    String draftTeamA;
    String draftFirstPicker;
    String winner;
    Instant draftDate;
    DraftTeamResult teamADraft;
    TournamentMatchTeamStats teamAStats;
    DraftTeamResult teamBDraft;
    TournamentMatchTeamStats teamBStats;
}
