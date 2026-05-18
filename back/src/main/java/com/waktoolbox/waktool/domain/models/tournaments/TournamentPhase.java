package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class TournamentPhase implements Serializable {
    int phase;
    int poolSize;
    int phaseType;
    int poolNumber;
    TournamentRoundModel[] roundModel;
    Boolean autoRefereeing;
    Boolean mustUseDifferentMapsPerRound;
    Integer draftAvailableBeforeMatchMinutes;
    Integer draftJoinDeadlineAfterOpenMinutes;
    Integer matchStartDeadlineAfterMatchMinutes;
    Integer draftTurnDurationSeconds;
    String draftModel;

    public boolean isEffectiveAutoRefereeing() {
        return autoRefereeing != null && autoRefereeing;
    }

    public boolean isEffectiveMustUseDifferentMapsPerRound() {
        return mustUseDifferentMapsPerRound != null && mustUseDifferentMapsPerRound;
    }

    public int getEffectiveDraftAvailableBeforeMatchMinutes() {
        return draftAvailableBeforeMatchMinutes != null ? draftAvailableBeforeMatchMinutes : 60;
    }

    public int getEffectiveDraftJoinDeadlineAfterOpenMinutes() {
        return draftJoinDeadlineAfterOpenMinutes != null ? draftJoinDeadlineAfterOpenMinutes : 15;
    }

    public int getEffectiveMatchStartDeadlineAfterMatchMinutes() {
        return matchStartDeadlineAfterMatchMinutes != null ? matchStartDeadlineAfterMatchMinutes : 15;
    }

    public int getEffectiveDraftTurnDurationSeconds() {
        return draftTurnDurationSeconds != null ? draftTurnDurationSeconds : 45;
    }

    public String getEffectiveDraftModel() {
        return draftModel != null ? draftModel : "WAKFU_CHAMPIONS";
    }
}
