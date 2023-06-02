import './App.css'
import {ThemeProvider} from "@mui/material";
import theme from "./theme";
import Footer from "./components/Footer.tsx";
import HeaderBar from "./components/HeaderBar.tsx";
import {RecoilRoot} from "recoil";
import {Suspense} from "react";

function App() {
    return (
        <div className="App">
            <RecoilRoot>
                <Suspense fallback={<div>Loading...</div>}>
                    <ThemeProvider theme={theme}>
                        <HeaderBar/>
                        <Footer/>
                    </ThemeProvider>
                </Suspense>
            </RecoilRoot>
        </div>
    )
}

export default App
