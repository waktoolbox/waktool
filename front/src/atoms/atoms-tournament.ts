import {atom} from "recoil";
import {TournamentTeamModel} from "../chore/tournament.ts";

export const myTournamentTeamState = atom<TournamentTeamModel | undefined>({
    key: "myTournamentTeamState",
    default: undefined
})

export const tournamentPhasesState = atom<number>({
    key: "tournamentPhasesState",
    default: 0
})

export const teamCacheState = atom<Map<string, string>>({
    key: "teamCacheState",
    default: new Map()
})