import {gfetch, pfetch, putFetch} from "../utils/fetch-utils.ts";
import {TournamentTeamModel} from "../chore/tournament.ts";


export async function tournamentLoader({params}: { params: { id?: string } }) {
    if (!params.id) throw new Error("No tournament id");
    return await gfetch(`/api/tournaments/${params.id}`);
}

export async function getMyTournamentTeam(tournamentId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/my-team`);
}

export async function getTournamentTeam(tournamentId: string, teamId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams/${teamId}`);
}

export async function getTeamApplications(tournamentId: string, teamId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/applications`);
}

export async function getTournamentTeams(tournamentId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams`);
}

export async function postRegisterTeam(tournamentId: string, team: TournamentTeamModel) {
    return await pfetch(`/api/tournaments/${tournamentId}/teams`, team);
}

export async function putEditTeam(tournamentId: string, team: TournamentTeamModel) {
    return await putFetch(`/api/tournaments/${tournamentId}/teams/${team.id}`, team);
}