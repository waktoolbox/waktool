import {atom} from "recoil";

export const accountCacheState = atom<Map<string, string>>({
    key: "accountCache",
    default: new Map()
})

export const streamerCacheState = atom<Map<string, string>>({
    key: "streamerCacheState",
    default: new Map()
})