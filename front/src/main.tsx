import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './utils/i18n';
import {RouterProvider} from "react-router-dom";
import {createRouter} from "./utils/router.tsx";

const router = createRouter();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>,
)
