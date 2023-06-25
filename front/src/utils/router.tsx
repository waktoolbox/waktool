import {createBrowserRouter} from "react-router-dom";
import Account from "../routes/Account.tsx";
import Home from "../routes/Home.tsx";
import App from "../App.tsx";
import {accountLoader, accountSaver} from "../services/account.ts";
import Draft from "../routes/Draft.tsx";

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
                }
            ]
        },

    ])
}