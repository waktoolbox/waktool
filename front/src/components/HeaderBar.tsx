import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import PersonIcon from '@mui/icons-material/Person';
import PersonIconOutlined from '@mui/icons-material/PersonOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import {useTranslation} from "react-i18next";
import {Navigate, useLocation} from "react-router-dom";
import LanguagePicker from "./LanguagePicker.tsx";
import MenuDrawer from "./MenuDrawer.tsx";
import {loginState, menuDrawerState} from "../atoms/atoms-header.ts";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {snackState} from "../atoms/atoms-snackbar.ts";
import MySnackbar from "./MySnackbar.tsx";

export default function HeaderBar() {
    const {t} = useTranslation();
    const [_, setDrawerState] = useRecoilState(menuDrawerState);
    const setSnackValue = useSetRecoilState(snackState);
    const logged = useRecoilValue(loginState);
    const location = useLocation();

    if (logged && location.pathname !== "/account" && logged.logged) {
        if (!logged.ankamaName || !logged.ankamaDiscriminator) {
            setSnackValue({
                severity: "error",
                message: t('error.missingAnkamaInfo') as string,
                open: true
            });
            return <Navigate to="/account"/>;
        }
    }

    return (
        <>
            <MenuDrawer/>
            <MySnackbar/>

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
                    {!logged?.logged && (
                        <a href={import.meta.env.VITE_DISCORD_OAUTH_URL}>
                            <Button variant="outlined" sx={{height: "38px"}}>
                                <PersonIcon/>
                                {t('connect')}
                            </Button>
                        </a>
                    )}

                    {logged?.logged && (
                        <a href={`${import.meta.env.VITE_BACKEND_URL}/api/oauth/disconnect`}>
                            <Button variant="outlined" sx={{height: "38px"}}>
                                <PersonIconOutlined/>
                                {t('disconnect')}
                            </Button>
                        </a>
                    )}

                    <Divider sx={{ml: 1, mr: 1}} orientation="vertical" variant="middle" flexItem/>

                    <LanguagePicker/>
                </Box>


            </AppBar>
        </>
    );
}