import {createBrowserRouter} from "react-router-dom";
import Account from "../routes/Account.tsx";
import Home from "../routes/Home.tsx";
import App from "../App.tsx";
import {accountLoader, accountSaver} from "../services/account.ts";
import Draft from "../routes/Draft.tsx";
import Tournament from "../routes/tournament/Tournament.tsx";
import {tournamentLoader} from "../services/tournament.ts";

export function createRouter() {
    return createBrowserRouter([
        {
            path: "/",
            element: <App/>,
            children: [
                {
                    path: "",
                    element: <Home/>
                },
                {
                    path: "account",
                    element: <Account/>,
                    loader: accountLoader,
                    action: accountSaver
                },
                {
                    path: "account/:id",
                    element: <Account/>,
                    loader: accountLoader,
                    action: accountSaver
                },
                {
                    path: "draft",
                    element: <Draft/>
                },
                {
                    path: "draft/:draftId",
                    element: <Draft/>
                },
                {
                    path: "tournament/:id",
                    element: <Tournament/>,
                    loader: tournamentLoader,
                    children: [
                        {
                            path: "tab/:targetTab",
                            element: <Tournament/>,
                        },
                        {
                            path: "tab/:targetTab/team/:teamId",
                            element: <Tournament/>,
                        }
                    ]
                }
            ]
        },

    ])
}