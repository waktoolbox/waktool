export enum DraftActionType {
    BAN = "BAN",
    PICK = "PICK"
}

export enum DraftTeam {
    NONE = "NONE",
    TEAM_A = "TEAM_A",
    TEAM_B = "TEAM_B"
}

export type DraftAction = {
    type: DraftActionType;
    team: DraftTeam;
    breed?: number;
    lockForPickingTeam?: boolean;
    lockForOpponentTeam?: boolean;
}

export const WAKFU_WARRIORS_DRAFT_ACTIONS: DraftAction[] = [
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.BAN, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true, lockForOpponentTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_A, lockForPickingTeam: true},
    {type: DraftActionType.PICK, team: DraftTeam.TEAM_B, lockForPickingTeam: true},
];

export type DraftTemplate = {
    name: string;
    actions: DraftAction[]
};

export const DraftTemplates: DraftTemplate[] = [
    {
        name: "Wakfu Warriors",
        actions: WAKFU_WARRIORS_DRAFT_ACTIONS
    }
];

export interface DraftConfiguration {
    leader?: string;
    providedByServer?: boolean;
    actions: DraftAction[];
}

export interface DraftUser {
    id: string;
    displayName: string;
    captain?: boolean;
    present?: boolean;
}

export interface DraftTeamInfo {
    id: string;
    name: string;
}

export interface DraftData {
    id: string;
    configuration: DraftConfiguration;
    history: DraftAction[];
    currentAction: number;

    users: DraftUser[];

    teamA?: DraftUser[];
    teamAInfo?: DraftTeamInfo;
    teamAReady?: boolean;
    teamB?: DraftUser[];
    teamBInfo?: DraftTeamInfo;
    teamBReady?: boolean;
}
