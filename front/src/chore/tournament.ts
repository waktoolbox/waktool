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
    logo: string;
    server: string;
    startDate: string;
    endDate: string;
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
}

export interface TournamentPhaseDefinition {
    phase: number;
    phaseType: TournamentPhaseType;
    roundModel: TournamentRoundDefinition[];

    poolSize?: number;
    poolNumber?: number;
}

export interface TournamentRoundDefinition {
    round: number;
    bo: number;
}

export interface TournamentTeamModel {
    id?: string;
    tournament: string;
    name: string;
    server: string;
    leader: string;
    players: string[];
    validatedPlayers: string[];
    catchPhrase: string;
    stats?: TournamentStatsModel;
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

    [key: string]: any; // prevent type error through super typing client side
}

export interface TournamentMatchRoundModel {
    round: number,
    draftTeamA?: string,
    draftFirstPicker?: string;
    draftDate?: string;
    draftId?: string;
    teamADraft?: TournamentDraftResultModel;
    teamAStats?: TournamentFightStatsModel;
    teamBDraft?: TournamentDraftResultModel;
    teamBStats?: TournamentFightStatsModel;
    map?: number;
    winner?: string;
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
    WAKFU_WARRIORS_BRACKET_TOURNAMENT
}