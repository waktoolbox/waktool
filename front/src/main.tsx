import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './utils/i18n';
import {RouterProvider} from "react-router-dom";
import {createRouter} from "./utils/router.tsx";
import './utils/socket.ts'
import {createEcosystem, EcosystemProvider} from "@zedux/react";

const router = createRouter();
const ecosystem = createEcosystem({id: 'waktool'});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <EcosystemProvider ecosystem={ecosystem}>
            <RouterProvider router={router}/>
        </EcosystemProvider>
    </React.StrictMode>,
)

