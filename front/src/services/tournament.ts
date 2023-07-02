import {detch, gfetch, pfetch, putFetch} from "../utils/fetch-utils.ts";
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

export async function acceptApplication(tournamentId: string, teamId: string, applicationId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/applications/${applicationId}`, {});
}

export async function deleteApplication(tournamentId: string, teamId: string, applicationId: string) {
    return await detch(`/api/tournaments/${tournamentId}/teams/${teamId}/applications/${applicationId}`);
}

export async function getMyTeamApplication(tournamentId: string, teamId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/my-application`);
}

export async function applyToTeam(tournamentId: string, teamId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/applications`, {});
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

export async function deleteTeamPlayer(tournamentId: string, teamId: string, playerId: string) {
    return await detch(`/api/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`);
}

export async function deleteTeam(tournamentId: string, teamId: string) {
    return await detch(`/api/tournaments/${tournamentId}/teams/${teamId}`);
}