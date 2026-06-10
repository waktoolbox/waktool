export interface LightTournament {
    id: string;
    name: string;
    logo: string;
    server: string;
    level: string;
    startDate: string;
    endDate: string;
}

export interface TournamentDefinition {
    id?: string;
    name: string;
    discordLink?: string;
    logo: string;
    server: string;
    startDate: string;
    endDate: string;
    mustRegisterTeamComposition: boolean;
    level: number;
    description: string;
    rewards: string;
    rules: string;

    teamNumber: number;
    teamSize: string;
    maps: number[];
    phases: TournamentPhaseDefinition[]

    admins: string[];
    referees: string[];
    streamers: string[];

    requiredBreeds?: number;
    maxTeamPlayers?: number;
    requiredBannedBreeds?: number;
    hideClassStats?: boolean;
    discordRoleStartDate?: string;
    demo?: Record<string, string>;
}

export interface TournamentPhaseDefinition {
    phase: number;
    phaseType: TournamentPhaseType;
    roundModel: TournamentRoundDefinition[];

    poolSize?: number;
    poolNumber?: number;
    autoRefereeing?: boolean;
    mustUseDifferentMapsPerRound?: boolean;
    draftAvailableBeforeMatchMinutes?: number;
    draftJoinDeadlineAfterOpenMinutes?: number;
    matchStartDeadlineAfterMatchMinutes?: number;
    draftTurnDurationSeconds?: number;
    draftModel?: string;
}

export interface TournamentRoundDefinition {
    round: number;
    bo: number;
    date?: string;
}

export interface TournamentTeamModel {
    id?: string;
    tournament: string;
    name: string;
    server: string;
    leader: string;
    players: string[];
    validatedPlayers: string[];
    breeds?: number[];
    bannedBreeds?: number[];
    catchPhrase: string;
    displayOnTeamList: boolean;
    stats?: TournamentStatsModel;
    victories?: number; // light view
    played?: number; // light view
}

export interface TournamentStatsModel {
    played: number;
    victories: number;
    statsByClass: TournamentStatsClassModel[];
}

export interface TournamentStatsClassModel {
    id: number;
    played: number;
    banned: number;
    victories: number;
    killed: number;
    death: number;
}

export interface TournamentMatchModel {
    id?: string;
    date?: string;
    done: boolean;
    teamA: string;
    teamB: string;
    referee?: string;
    streamer?: string;
    winner?: string;
    phase?: number,
    round?: number;
    rounds: TournamentMatchRoundModel[];
    thirdPlaceMatch?: boolean;
    matchIndex?: number;

    [key: string]: any; // prevent type error through super typing client side
}

export interface TournamentMatchRoundModel {
    round: number,
    draftTeamA?: string,
    draftFirstPicker?: string;
    draftDate?: string;
    draftJoinDeadline?: string;
    matchStartDeadline?: string;
    draftId?: string;
    teamADraft?: TournamentDraftResultModel;
    teamAStats?: TournamentFightStatsModel;
    teamBDraft?: TournamentDraftResultModel;
    teamBStats?: TournamentFightStatsModel;
    history?: TournamentMatchHistory;
    map?: number;
    winner?: string;
}

export interface TournamentMatchHistory {
    turns: number;
    players: string[];
    entries: TournamentMatchHistoryEntry[];
}

export interface TournamentMatchHistoryEntry {
    team?: string;
    source?: number;
    target?: number;
}

export interface TournamentDraftResultModel {
    pickedClasses: number[];
    bannedClasses: number[];
}

export interface TournamentFightStatsModel {
    turns?: number;
    killedBreeds?: boolean[],
    killerBreeds?: number[]
}

export enum TournamentPhaseType {
    NONE,
    WAKFU_WARRIORS_ROUND_ROBIN,
    WAKFU_WARRIORS_BRACKET_TOURNAMENT,
    WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT,
    WAKFU_CHAMPIONS_QUALIFICATION,
    WAKFU_CHAMPIONS_BRACKET
}

export interface MatchReportModel {
    matchId: string;
    round: number;
    tournamentId: string;
    teamAReportedWinner?: string;
    teamAReporterId?: string;
    teamAScreenshot?: string;
    teamADisputeExplanation?: string;
    teamBReportedWinner?: string;
    teamBReporterId?: string;
    teamBScreenshot?: string;
    teamBDisputeExplanation?: string;
    disputed: boolean;
    createdAt?: string;
}

export interface TournamentPhaseDataTeam {
    id: string;
    breeds: number[];
    bannedBreeds: number[];
    lost: number; // In swiss, repurposed as wins
}

export interface TournamentPhaseData {
    teams: TournamentPhaseDataTeam[];
    matches: string[];
    currentRound: number;
}

export interface TournamentStandingsResponse {
    phases: TournamentPhaseData[];
}

