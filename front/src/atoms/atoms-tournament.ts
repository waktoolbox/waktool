import {atom} from "@zedux/react";
import {TournamentTeamModel} from "../chore/tournament.ts";

export const myTournamentTeamState = atom<TournamentTeamModel | undefined>(
    "myTournamentTeamState",
    undefined
)

export const tournamentPhasesState = atom<number>(
    "tournamentPhasesState",
    0
)

export const teamCacheState = atom<Map<string, string>>(
    "teamCacheState",
    new Map()
)