package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class Tournament implements Serializable {
    String id;
    String logo;
    int[] maps;
    String name;
    String discordLink;
    String matchNotificationChannel;
    String level;
    Object rules;
    List<String> admins;
    List<TournamentPhase> phases;
    String server;
    Instant startDate;
    Instant endDate;
    Boolean mustRegisterTeamComposition;
    Object rewards;
    List<String> referees;
    String teamSize;
    List<String> streamers;
    String teamNumber;
    Object description;
    Integer draftAvailableMinutesBeforeMatch;
    Integer requiredBreeds;
    Integer maxTeamPlayers;
    Boolean requireBannedBreed;

    public int getEffectiveRequiredBreeds() {
        return requiredBreeds != null ? requiredBreeds : 6;
    }

    public int getEffectiveMaxTeamPlayers() {
        return maxTeamPlayers != null ? maxTeamPlayers : Integer.MAX_VALUE;
    }

    public boolean isEffectiveRequireBannedBreed() {
        return Boolean.TRUE.equals(requireBannedBreed);
    }
}
