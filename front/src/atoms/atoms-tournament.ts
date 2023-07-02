import {atom} from "recoil";
import {TournamentTeamModel} from "../chore/tournament.ts";

export const myTournamentTeamState = atom<TournamentTeamModel>({
    key: "myTournamentTeamState",
    default: {} as TournamentTeamModel
})