import {gfetch, pfetch} from "../utils/fetch-utils.ts";
import {ActionFunctionArgs} from "react-router-dom";

export type Account = {
    "id": string,
    "username": string,
    "discriminator": string,
    "ankamaName": string,
    "ankamaDiscriminator": string,
    "twitchUrl": string
}

export async function accountLoader({params}: { params: { id?: string } }) {
    return await gfetch("/api/accounts" + (params.id ? `/${params.id}` : ""));
}

export async function accountSaver({request}: ActionFunctionArgs) {
    const form = await request.formData();
    const body = {
        ankamaName: form.get("ankamaName"),
        ankamaDiscriminator: form.get("ankamaDiscriminator"),
        twitchUrl: form.get("twitchUrl")
    }

    return await pfetch(`/api/accounts/${form.get("id")}`, body);
}

export async function accountsLoader(accountIds: string[]) {
    return await pfetch("/api/accounts:search", {ids: accountIds});
}

export async function streamersLoader(accountIds: string[]) {
    return await pfetch("/api/streamers:search", {ids: accountIds});
}
