package com.waktoolbox.waktool.domain.controllers.tournaments;

public enum TournamentPhaseType {
    NONE,
    WAKFU_WARRIORS_ROUND_ROBIN,
    WAKFU_WARRIORS_BRACKET_TOURNAMENT,
    WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT;

    public static TournamentPhaseType fromTypeIndex(int index) {
        return switch (index) {
            case 0 -> NONE;
            case 1 -> WAKFU_WARRIORS_ROUND_ROBIN;
            case 2 -> WAKFU_WARRIORS_BRACKET_TOURNAMENT;
            case 3 -> WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT;
            default -> throw new IllegalStateException("Unexpected value: " + index);
        };
    }
}
