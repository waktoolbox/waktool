import {TournamentMatchModel} from "../../chore/tournament.ts";
import {useEffect, useState} from "react";
import {Trans, useTranslation} from "react-i18next";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import TournamentTeamMatchSquareView from "./TournamentTeamMatchSquareView.tsx";
import TournamentMatchInlinedView from "./TournamentMatchInlinedView.tsx";

type TournamentRoundRobinListViewProps = {
    matches: TournamentMatchModel[];
}

export default function TournamentRoundRobinListView(props: TournamentRoundRobinListViewProps) {
    const {t} = useTranslation();
    const {matches} = props;
    const [tab, setTab] = useState(0);
    const [tabs, setTabs] = useState<string[]>([]);
    const [matchesByRound, setMatchesByRound] = useState<TournamentMatchModel[][]>([]);

    useEffect(() => {
        const tabs: string[] = [];
        tabs.push(t('tournament.match.allMatches'))
        const maxPool = Math.max.apply(null, matches.map(m => m.pool));
        for (let i = 1; i <= maxPool + 1; i++) {
            tabs.push(t('tournament.match.pool', {pool: i}))
        }

        setTabs(tabs);
    }, [])

    useEffect(() => {
        const matchesByR: TournamentMatchModel[][] = [];
        for (let i = 1; i < 3 + 1; i++) {
            matchesByR[i] = matches.filter(m => m.pool === tab - 1 && m.round === i);
        }
        setMatchesByRound(matchesByR)
    }, [tab])

    return (
        <Grid container>
            <Grid item xs={12} sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, ml: 2, mr: 2}}>
                <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
                    {tabs && tabs.map((tab, index) => (
                        <Tab key={index} label={tab}/>
                    ))}
                </Tabs>
                <Grid container sx={{pl: 4, mb: 4}}>
                    {tab <= 0 && matches && matches.map((m, index) => (
                        <Grid item xs={12} key={index}>
                            <TournamentMatchInlinedView match={m} backgroundColor="#1f333a"/>
                        </Grid>
                    ))}

                    {tab > 0 && matchesByRound && matchesByRound.map((matchesByR, index) => (
                        <Grid key={`g${index}`} item xs={12} lg={4}>
                            <Card sx={{
                                mb: 2, mr: 2, mt: 2,
                                borderRadius: 4,
                                boxShadow: '5px 5px 15px 0px #000000',
                                '&.MuiCardContent-root': {p: 2}
                            }}>
                                <CardContent sx={{
                                    "&:last-child": {
                                        pb: 0
                                    }
                                }}>
                                    <Typography variant="h5" sx={{textAlign: "start"}}>
                                        <Trans i18nKey="tournament.match.roundRobinPhaseTitle"
                                               components={{span: <span className="firstWord"/>}}
                                               values={{nb: index}}/>
                                    </Typography>

                                    {matchesByR && matchesByR.length > 0 && matchesByR.map((match, i) => (
                                        <TournamentTeamMatchSquareView key={`m${index}${i}`} match={match}
                                                                       backgroundColor="#162329"/>
                                    ))}
                                    {(!matchesByR || matchesByR.length <= 0) &&
                                        <Typography sx={{ml: 2, mt: 2, pb: 2}}
                                                    variant="h5">{t('tournament.match.noMatchPlanned')}</Typography>
                                    }
                                </CardContent>
                            </Card>

                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    )
}