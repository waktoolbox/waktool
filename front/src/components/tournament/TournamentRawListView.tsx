import {TournamentMatchModel} from "../../chore/tournament.ts";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TournamentMatchInlinedView from "./TournamentMatchInlinedView.tsx";

type TournamentRawListViewProps = {
    matches: TournamentMatchModel[];
}

export default function TournamentRawListView(props: TournamentRawListViewProps) {
    const {t} = useTranslation();
    const {matches} = props;
    const [tab, setTab] = useState(0);
    const [tabs] = useState<string[]>([t('tournament.match.allMatches')]);

    return (
        <Grid container>
            <Grid item xs={12} sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, ml: 2, mr: 2}}>
                <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
                    {tabs && tabs.map((tab, index) => (
                        <Tab key={index} label={tab}/>
                    ))}
                </Tabs>
                <Grid container sx={{pl: 4, mb: 4}}>
                    {matches && matches.map((m, index) => (
                        <Grid item xs={12} key={index}>
                            <TournamentMatchInlinedView match={m} backgroundColor="#1f333a"/>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    )
}