package com.waktoolbox.waktool.domain.controllers.tournaments;

public enum TournamentPhaseType {
    NONE,
    WAKFU_WARRIORS_ROUND_ROBIN,
    WAKFU_WARRIORS_BRACKET_TOURNAMENT,
    WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT,
    WAKFU_CHAMPIONS_QUALIFICATION,
    WAKFU_CHAMPIONS_BRACKET;

    public static TournamentPhaseType fromTypeIndex(int index) {
        return switch (index) {
            case 0 -> NONE;
            case 1 -> WAKFU_WARRIORS_ROUND_ROBIN;
            case 2 -> WAKFU_WARRIORS_BRACKET_TOURNAMENT;
            case 3 -> WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT;
            case 4 -> WAKFU_CHAMPIONS_QUALIFICATION;
            case 5 -> WAKFU_CHAMPIONS_BRACKET;
            default -> throw new IllegalStateException("Unexpected value: " + index);
        };
    }
}
