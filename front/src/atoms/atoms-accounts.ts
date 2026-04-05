import {atom} from "@zedux/react";

export type Account = {
    displayName: string,
    fullAnkamaName?: string
}

export const accountCacheState = atom<Map<string, Account>>(
    "accountCache",
    new Map()
)

export const streamerCacheState = atom<Map<string, string>>(
    "streamerCacheState",
    new Map()
)