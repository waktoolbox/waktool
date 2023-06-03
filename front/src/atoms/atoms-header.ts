import {atom, selector} from "recoil";
import {gfetch} from "../utils/fetch-utils.ts";

export const menuDrawerState = atom({
    key: 'menuDrawerState',
    default: false
})

export const loginStateUpdater = atom({
    key: "loginStateUpdater",
    default: 0
});

export const loginState = atom({
    key: 'loginState',
    default: selector({
        key: 'loginState/default',
        get: async ({get}) => {
            get(loginStateUpdater)
            const data = await gfetch("/api/accounts");
            return {
                ...data,
                logged: data.discordId !== null
            };
        }
    })
});