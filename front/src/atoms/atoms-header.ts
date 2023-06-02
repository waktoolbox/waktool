import {atom, selector} from "recoil";

export const menuDrawerState = atom({
    key: 'menuDrawerState',
    default: false
})

export const loginState = atom({
    key: 'loginState',
    default: selector({
        key: 'loginState/default',
        get: async () => {
            console.log("call")
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/oauth/whoami", {
                credentials: 'include',
                headers: {
                    "Access-Control-Allow-Origin": import.meta.env.VITE_BACKEND_URL
                }
            })
            const data = await response.json();
            return {
                discordId: data.discordId,
                logged: data.discordId !== null
            };
        }
    })
})