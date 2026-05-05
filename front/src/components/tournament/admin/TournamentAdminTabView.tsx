import {useState} from "react";
import {useLoaderData} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAtomValue} from "@zedux/react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import {TournamentDefinition} from "../../../chore/tournament.ts";
import {loginIdState} from "../../../atoms/atoms-header.ts";
import TournamentAdminControlTab from "./TournamentAdminControlTab.tsx";
import TournamentAdminDemoTab from "./TournamentAdminDemoTab.tsx";
import TournamentAdminDisputesTab from "./TournamentAdminDisputesTab.tsx";
import TournamentAdminTeamsTab from "./TournamentAdminTeamsTab.tsx";

type LoaderResponse = {
    tournament: TournamentDefinition
}

enum AdminTab {
    CONTROL = "control",
    DISPUTES = "disputes",
    TEAMS = "teams",
    DEMO = "demo",
}

export default function TournamentAdminTabView() {
    const {t} = useTranslation();
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const me = useAtomValue(loginIdState);
    const isAdmin = me != null && tournament.admins?.includes(me);

    const tabs = isAdmin
        ? [AdminTab.CONTROL, AdminTab.DISPUTES, AdminTab.TEAMS, ...(tournament.demo ? [AdminTab.DEMO] : [])]
        : [AdminTab.DISPUTES];

    const [activeTab, setActiveTab] = useState(0);

    const currentTab = tabs[activeTab] || tabs[0];

    return (
        <Box sx={{p: 2}}>
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {color: '#8299a1', textTransform: 'none', fontWeight: 'bold'},
                    '& .Mui-selected': {color: '#07c6b6'},
                    '& .MuiTabs-indicator': {backgroundColor: '#07c6b6'},
                }}
            >
                {tabs.map(tab => (
                    <Tab key={tab} label={t(`tournament.admin.tabs.${tab}`)}/>
                ))}
            </Tabs>

            {currentTab === AdminTab.CONTROL && (
                <TournamentAdminControlTab tournament={tournament} active={true}/>
            )}

            {currentTab === AdminTab.DISPUTES && (
                <TournamentAdminDisputesTab tournament={tournament} active={true}/>
            )}

            {currentTab === AdminTab.TEAMS && (
                <TournamentAdminTeamsTab tournament={tournament} active={true}/>
            )}

            {currentTab === AdminTab.DEMO && (
                <TournamentAdminDemoTab tournament={tournament} active={true}/>
            )}
        </Box>
    );
}
