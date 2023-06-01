import {AppBar, Box, Button, Divider, IconButton} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import {useTranslation} from "react-i18next";
import LanguagePicker from "./LanguagePicker.tsx";
import MenuDrawer from "./MenuDrawer.tsx";
import {menuDrawerState} from "../atoms/atoms-header.ts";
import {useRecoilState} from "recoil";

export default function HeaderBar() {
    const {t} = useTranslation();
    const [_, setDrawerState] = useRecoilState(menuDrawerState);

    return (
        <>
            <MenuDrawer/>

            <AppBar position="static" sx={{
                boxShadow: 3,
                p: 0.5,
                flexDirection: "row",
                justifyContent: "space-around",
                height: "48px"
            }}>
                <Box sx={{
                    flexWrap: "nowrap",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                        onClick={() => setDrawerState(true)}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <img src="/logo.png" alt="logo"/>
                </Box>

                <Box sx={{
                    flexWrap: "nowrap",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center"
                }}>
                    <Button variant="outlined" sx={{height: "38px"}}>
                        <PersonIcon/>
                        {t('connect')}
                    </Button>

                    <Divider sx={{ml: 1, mr: 1}} orientation="vertical" variant="middle" flexItem/>

                    <LanguagePicker/>
                </Box>


            </AppBar>
        </>
    );
}