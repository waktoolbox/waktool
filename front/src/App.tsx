import './App.css'
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import theme from "./utils/theme.ts";
import Footer from "./components/Footer.tsx";
import HeaderBar from "./components/HeaderBar.tsx";
import {RecoilRoot} from "recoil";
import {Suspense} from "react";
import {Outlet} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <RecoilRoot>
                <Suspense fallback={<div>Loading...</div>}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <ThemeProvider theme={theme}>
                            <HeaderBar/>
                            <Outlet/>
                            <Footer/>
                        </ThemeProvider>
                    </LocalizationProvider>
                </Suspense>
            </RecoilRoot>
        </div>
    )
}

export default App
