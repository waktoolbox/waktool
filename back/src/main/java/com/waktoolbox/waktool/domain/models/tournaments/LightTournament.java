package com.waktoolbox.waktool.domain.models.tournaments;

import java.time.Instant;

public interface LightTournament {
    String getId();

    String getName();

    String getLogo();

    String getServer();

    String getLevel();

    Instant getStartDate();

    Instant getEndDate();
}
