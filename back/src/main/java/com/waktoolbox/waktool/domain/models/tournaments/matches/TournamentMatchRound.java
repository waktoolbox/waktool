package com.waktoolbox.waktool.domain.models.tournaments.matches;

import com.waktoolbox.waktool.domain.models.drafts.DraftTeamResult;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
public class TournamentMatchRound implements Serializable {
    int map;
    int round;
    String draftId;
    String draftTeamA;
    String draftFirstPicker;
    String winner;
    Instant draftDate;
    Instant draftStartDate;
    Instant draftJoinDeadline;
    Instant matchStartDeadline;
    DraftTeamResult teamADraft;
    TournamentMatchTeamStats teamAStats;
    DraftTeamResult teamBDraft;
    TournamentMatchTeamStats teamBStats;
    TournamentMatchHistory history;
}
