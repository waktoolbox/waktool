import './App.css'
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Grid from "@mui/material/Grid";
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
                    <ThemeProvider theme={theme}>
                        <HeaderBar/>
                        <Grid container sx={{width: {xs: '100%', md: '80%'}, margin: 'auto'}}>
                            <Outlet/>
                        </Grid>
                        <Footer/>
                    </ThemeProvider>
                </Suspense>
            </RecoilRoot>
        </div>
    )
}

export default App
