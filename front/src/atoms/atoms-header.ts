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
                logged: data.id !== null && data.id !== undefined
            };
        }
    })
});

export const loginIdState = atom({
    key: 'loginIdState',
    default: selector({
        key: 'loginIdState/default',
        get: async ({get}) => {
            return get(loginState)?.id;
        }
    })
});