import {atom} from "recoil";

export const accountCacheState = atom<Map<string, string>>({
    key: "accountCache",
    default: new Map()
})