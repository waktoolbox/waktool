import {gfetch} from "../utils/fetch-utils.ts";


export async function tournamentLoader({params}: { params: { id?: string } }) {
    if (!params.id) throw new Error("No tournament id");
    return await gfetch(`/api/tournaments/${params.id}`);
}

export async function getMyTournamentTeam(tournamentId: string) {
    return await gfetch(`/api/tournaments/${tournamentId}/my-team`);
}