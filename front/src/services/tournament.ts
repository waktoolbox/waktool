import {detch, gfetch, pfetch, putFetch} from "../utils/fetch-utils.ts";
import {TournamentMatchHistory, TournamentTeamModel} from "../chore/tournament.ts";
import {DraftTeam} from "../chore/draft.ts";


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

export async function teamSearch(tournamentId: string, teamIds: string[]) {
    return await pfetch(`/api/tournaments/${tournamentId}/teams:search`, {ids: teamIds});
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

export async function getPhases(tournamentId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/phases`);
}

export type PostMatchesSearchParameters = {
    type: "PLANNING" | "RESULTS"
    phase: number
}

export async function postMatchesSearch(tournamentId: string, searchParameters: PostMatchesSearchParameters) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches-search`, searchParameters);
}

export async function getMatch(tournamentId: string, matchId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/matches/${matchId}`);
}

export async function getTeamMatches(tournamentId: string, teamId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/matches`);
}

export async function getTeamPlayers(tournamentId: string, teamId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/teams/${teamId}/players`);
}

export async function postGoToNextPhase(tournamentId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/admin-go-to-next-phase`, {});
}

export async function postRecomputeStats(tournamentId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/admin-recompute-stats`, {});
}

export async function streamerSetMeAsStreamer(tournamentId: string, matchId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/set-me-as-streamer`, {});
}

export async function streamerRemoveStreamer(tournamentId: string, matchId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/remove-streamer`, {});
}

export async function refereeSetMeAsReferee(tournamentId: string, matchId: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/set-me-as-referee`, {});
}

export async function refereeSetMatchDate(tournamentId: string, matchId: string, date: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/referee-set-match-date`, {date: date});
}

export async function refereeValidateMatchResult(tournamentId: string, matchId: string, winner: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/referee-validate-match-result`, {winner: winner});
}

export async function refereeRoundRerollMap(tournamentId: string, matchId: string, round: number) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/rounds/${round}/referee-reroll-map`, {});
}

export async function refereeRoundDraftFirstPicker(tournamentId: string, matchId: string, round: number, team: DraftTeam | undefined) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/rounds/${round}/referee-draft-first-picker`, {team: team});
}

export async function refereeRoundResetDraft(tournamentId: string, matchId: string, round: number) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/rounds/${round}/referee-reset-draft`, {});
}

export async function refereeRoundSendStats(tournamentId: string, matchId: string, round: number, history: TournamentMatchHistory, winner: string) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/rounds/${round}/referee-send-stats`, {
        history: history,
        winner: winner
    });
}

export async function userStartDraft(tournamentId: string, matchId: string, round: number, team: DraftTeam | undefined) {
    return await pfetch(`/api/tournaments/${tournamentId}/matches/${matchId}/rounds/${round}/user-start-draft`, {team: team});
}