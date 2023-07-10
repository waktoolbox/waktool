package com.waktoolbox.waktool.domain.models.tournaments.matches;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatchesSearchParameters {
    MatchesSearchType type;
    int phase;
}
