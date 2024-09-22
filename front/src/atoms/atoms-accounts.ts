import {atom} from "recoil";

export type Account = {
    displayName: string,
    fullAnkamaName?: string
}

export const accountCacheState = atom<Map<string, Account>>({
    key: "accountCache",
    default: new Map()
})

export const streamerCacheState = atom<Map<string, string>>({
    key: "streamerCacheState",
    default: new Map()
})