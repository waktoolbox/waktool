import {atom, injectAtomValue, injectEffect, injectStore} from "@zedux/react";
import {gfetch} from "../utils/fetch-utils.ts";

export const menuDrawerState = atom("menuDrawerState", false);

export const loginStateUpdater = atom("loginStateUpdater", 0);

export const loginState = atom<any>("loginState", () => {
    const updater = injectAtomValue(loginStateUpdater);
    const store = injectStore({
        data: {logged: false},
        status: 'loading'
    });

    injectEffect(() => {
        gfetch("/api/accounts")
            .then(data => {
                if (!data) {
                    store.setState({data: {logged: false}, status: 'success'});
                } else {
                    store.setState({
                        data: {...data, logged: data.id !== null && data.id !== undefined},
                        status: 'success'
                    });
                }
            })
            .catch(() => {
                store.setState({data: {logged: false}, status: 'error'});
            });
    }, [updater]);

    return store;
});


export const loginIdState = atom("loginIdState", () => {
    const loginDataState = injectAtomValue(loginState);
    return (loginDataState as any)?.data?.id as string | undefined;
});


export const languageState = atom('languageState', 'en');