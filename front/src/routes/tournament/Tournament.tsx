import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import {useLoaderData, useNavigate, useParams} from "react-router-dom";
import {TournamentDefinition} from "../../chore/tournament.ts";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {useTranslation} from "react-i18next";
import Stack from "@mui/material/Stack";
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import TournamentInformationsView from "../../components/tournament/TournamentInformationsView.tsx";
import {useRecoilState} from "recoil";
import {accountCacheState} from "../../atoms/atoms-accounts.ts";
import {accountsLoader} from "../../services/account.ts";
import {getMyTournamentTeam} from "../../services/tournament.ts";
import {myTournamentTeamState} from "../../atoms/atoms-tournament.ts";

const MenuButtonsStyle = {
    marginLeft: 3,
    marginRight: 3,
    fontSize: '1.1rem',
    color: '#8299a1',
    backgroundColor: 'rgba(0,0,0,0)'
}

const ActiveMenuButtonsStyle = {
    color: '#017d7f'
}

enum Tabs {
    HOME,
    TEAMS,
    SINGLE_TEAM,
    PLANNING,
    MATCH,
    RESULTS,
    TREE
}

type LoaderResponse = {
    tournament: TournamentDefinition
}

// TODO late : clean this code
export default function Tournament() {
    const {t} = useTranslation();
    const {id, targetTab} = useParams();
    const [accountsCache, setAccounts] = useRecoilState(accountCacheState);
    const [_, setMyTournamentTeam] = useRecoilState(myTournamentTeamState);

    const [tab, setTab] = useState(targetTab ? +targetTab : Tabs.HOME);
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const navigate = useNavigate();

    useEffect(() => {
        const accounts = [...tournament.admins, ...tournament.referees, ...tournament.streamers];
        const accountsToRequest = accounts.filter(accountId => !accountsCache.get(accountId));
        accountsLoader(accountsToRequest).then((response) => {
            const newCache = new Map(accountsCache);
            for (const account of response.accounts) {
                newCache.set(account.id, account.displayName);
            }
            setAccounts(newCache);
        });

        getMyTournamentTeam(tournament.id || "").then(response => {
            setMyTournamentTeam(response.team);
        })
    }, []);

    const categories = [
        {
            tab: Tabs.HOME,
            menu: true,
            content: <TournamentInformationsView/>,
            icon: <BookmarksIcon sx={{color: (tab === Tabs.HOME ? "017d7f" : "8299a1"), mr: 1}}/>,
            label: t('tournament.menu.home'),
            disabled: false
        },
        {
            tab: Tabs.TEAMS,
            menu: true,
            icon: <Diversity3Icon sx={{color: (tab === Tabs.HOME ? "017d7f" : "8299a1"), mr: 1}}/>,
            label: t('tournament.menu.teams'),
            disabled: Date.parse(tournament.startDate).toString() > Date.now().toString()
        },
        {
            tab: Tabs.SINGLE_TEAM,
            menu: false
        },
        {
            tab: Tabs.PLANNING,
            menu: true,
            icon: <CalendarMonthIcon sx={{color: (tab === Tabs.HOME ? "017d7f" : "8299a1"), mr: 1}}/>,
            label: t('tournament.menu.planning'),
            disabled: Date.parse(tournament.startDate).toString() > Date.now().toString()
        },
        {
            tab: Tabs.MATCH,
            menu: false
        },
        {
            tab: Tabs.RESULTS,
            menu: true,
            icon: <EmojiEventsIcon sx={{color: (tab === Tabs.HOME ? "017d7f" : "8299a1"), mr: 1}}/>,
            label: t('tournament.menu.results'),
            disabled: Date.parse(tournament.startDate).toString() > Date.now().toString()
        }
    ]

    const changeTab = (newTab: Tabs) => {
        switch (newTab) {
            case Tabs.HOME:
                navigate(`/tournament/${id}`);
                break;
            case Tabs.TEAMS:
                navigate(`/tournament/${id}/tab/1`);
                break;
            case Tabs.PLANNING:
                navigate(`/tournament/${id}/tab/3`);
                break;
            case Tabs.RESULTS:
                navigate(`/tournament/${id}/tab/5`);
                break;
            case Tabs.TREE:
                navigate(`/tournament/${id}/tab/6`);
                break;
        }
        setTab(newTab)
    }

    return (
        <Grid container>
            <Grid item xs={12} sx={{width: "100%", backgroundColor: "#162834"}}>
                <img src={tournament.logo} alt="logo"
                     style={{maxWidth: "1268px", width: "100%", objectFit: "cover"}}/>
            </Grid>

            <Grid item xs={12} sx={{width: {xs: '100%', md: '80%'}, margin: 'auto'}}>
                <Grid container>
                    <Grid item xs={12} md={10} xl={8} sx={{backgroundColor: "#162329", margin: 'auto'}}>
                        <Stack>
                            <Typography variant="h4" sx={{
                                textAlign: "start",
                                pt: 3,
                                pl: 3,
                                textTransform: "uppercase"
                            }}>{tournament.name}</Typography>
                            <Typography variant="h6" sx={{textAlign: "start", pl: 3}}>
                                {t('tournament.fromTo', {
                                    from: new Date(Date.parse(tournament.startDate)),
                                    to: new Date(Date.parse(tournament.endDate))
                                })}
                            </Typography>
                            <Typography sx={{
                                ml: 3, mt: 2, mb: 3,
                                borderRadius: 3, backgroundColor: "#017d7f",
                                width: "150px", height: "40px",
                                pl: 2, pr: 2,
                                display: "flex", flexDirection: "column", justifyContent: "center"
                            }}>
                                <b>{t('tournament.display.levelAndServer', {
                                    level: tournament.level,
                                    server: tournament.server
                                })}</b>
                            </Typography>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={10} xl={8} sx={{backgroundColor: "#1f333a", pb: 4, margin: 'auto'}}>
                        <Stack direction={{xs: 'column', lg: 'row'}} sx={{ml: 2, mt: 2}}
                               divider={<Divider sx={{ml: 1, mr: 1}} orientation="vertical" variant="middle" flexItem/>}
                        >
                            {categories.filter(entry => entry.menu).map((button, index) => (
                                <Button key={index} variant="text"
                                        disabled={button.disabled}
                                        style={{...MenuButtonsStyle, ...(tab === button.tab ? ActiveMenuButtonsStyle : {})}}
                                        onClick={() => changeTab(button.tab)}
                                >
                                    {button.icon}
                                    {button.label}
                                </Button>
                            ))}
                        </Stack>
                        <Divider sx={{ml: 3, mr: 3, mt: 2, mb: 2}} variant="middle" flexItem/>

                        {categories[tab].content}
                    </Grid>

                </Grid>

            </Grid>
        </Grid>
    );
}