import './App.css'
import {ThemeProvider} from "@mui/material";
import theme from "./theme";
import Footer from "./components/Footer.tsx";
import HeaderBar from "./components/HeaderBar.tsx";
import {RecoilRoot} from "recoil";

function App() {
    return (
        <div className="App">
            <RecoilRoot>
                <ThemeProvider theme={theme}>
                    <HeaderBar/>
                    <Footer/>
                </ThemeProvider>
            </RecoilRoot>
        </div>
    )
}

export default App
