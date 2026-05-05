package com.waktoolbox.waktool.domain.models.tournaments;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
public class TournamentRoundModel implements Serializable {
    int bo;
    int round;
    Instant date;
}