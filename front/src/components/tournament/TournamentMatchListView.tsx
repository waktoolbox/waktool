import Grid from "@mui/material/Grid";
import {ReactComponentElement, useEffect, useState} from "react";
import Typography from "@mui/material/Typography";
import {useTranslation} from "react-i18next";
import {postMatchesSearch, teamSearch} from "../../services/tournament.ts";
import {useLoaderData, useParams} from "react-router-dom";
import {useRecoilState, useRecoilValue} from "recoil";
import {teamCacheState, tournamentPhasesState} from "../../atoms/atoms-tournament.ts";
import TournamentPhaseButton from "./TournamentPhaseButton.tsx";
import {TournamentDefinition, TournamentMatchModel, TournamentPhaseType} from "../../chore/tournament.ts";
import TournamentRoundRobinListView from "./TournamentRoundRobinListView.tsx";
import TournamentRawListView from "./TournamentRawListView.tsx";

type TournamentMatchListViewProps = {
    tab: "PLANNING" | "RESULTS"
}

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentMatchListView(props: TournamentMatchListViewProps) {
    const {tab} = props;
    const [previousTab, setPreviousTab] = useState(tab);
    const {id} = useParams();
    const {t} = useTranslation();
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const [tournamentPhaseComponent, setTournamentPhaseComponent] = useState<ReactComponentElement<any> | undefined>(undefined);
    const phases = useRecoilValue(tournamentPhasesState)
    const [teamCache, setTeamCache] = useRecoilState(teamCacheState);
    const [displayedPhase, setDisplayedPhase] = useState(phases);
    const [matchesToDisplay, setMatchesToDisplay] = useState<TournamentMatchModel[]>([])

    useEffect(() => {
        if (displayedPhase !== 0) return;
        setDisplayedPhase(phases);
    }, [phases])

    useEffect(() => {
        if (displayedPhase <= 0) return;
        let phaseToUse = displayedPhase;
        if (previousTab !== tab) { // reset phase on tab change to avoid displaying wrong phase
            setPreviousTab(tab)
            phaseToUse = phases;
        }

        postMatchesSearch(id || "", {
            type: tab,
            phase: phaseToUse
        }).then(response => {
            const matches = response.matches as TournamentMatchModel[] | undefined;

            setMatchesToDisplay(matches?.sort((a, b) => {
                const aDate = a.date ? new Date(a.date).getTime() : 0;
                const bDate = b.date ? new Date(b.date).getTime() : 0;
                if (tab === "PLANNING") {
                    return aDate - bDate;
                } else if (tab === "RESULTS") {
                    return bDate - aDate;
                }
                return 0;
            }) ?? []);

            if (matches) {
                const toLoad = []
                for (const match of matches) {
                    if (match.teamA && !teamCache.get(match.teamA)) toLoad.push(match.teamA);
                    if (match.teamB && !teamCache.get(match.teamB)) toLoad.push(match.teamB);
                }
                if (toLoad.length > 0) {
                    teamSearch(id || "", toLoad).then(response => {
                        const ltc = new Map(teamCache);
                        for (const team of response.teams) {
                            ltc.set(team.id, team.name);
                        }
                        setTeamCache(ltc);
                    })
                }
            }
        })
    }, [displayedPhase, tab])

    useEffect(() => {
        if (displayedPhase <= 0) return;
        const phaseType = tournament.phases[(displayedPhase || 1) - 1].phaseType;
        switch (phaseType) {
            case TournamentPhaseType.WAKFU_WARRIORS_ROUND_ROBIN:
                setTournamentPhaseComponent(<TournamentRoundRobinListView matches={matchesToDisplay}/>)
                break;
            case TournamentPhaseType.WAKFU_WARRIORS_BRACKET_TOURNAMENT:
            case TournamentPhaseType.WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT:
                setTournamentPhaseComponent(<TournamentRawListView matches={matchesToDisplay}/>)
                break;
        }
    }, [matchesToDisplay])

    function onPhaseChange(phase: number) {
        setDisplayedPhase(phase);
    }

    return (
        <Grid container>
            <Grid item xs={12} sx={{mb: 2}}>
                <Typography
                    variant="h4">{t('tournament.menu.' + (tab === "PLANNING" ? "planning" : "results"))}</Typography>
            </Grid>

            <Grid item xs={12} sx={{mb: 2}} hidden={tab === "PLANNING"}>
                <TournamentPhaseButton onChange={onPhaseChange}/>
            </Grid>

            {matchesToDisplay && matchesToDisplay.length > 0 && (
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={12}>
                            {tournamentPhaseComponent}
                        </Grid>
                    </Grid>
                </Grid>
            )}

            {(!matchesToDisplay || matchesToDisplay.length <= 0) && (
                <Grid item xs={12}>
                    <Typography
                        variant="h5">{t('tournament.match.noMatchPlanned')}</Typography>
                </Grid>
            )}
        </Grid>
    )
}