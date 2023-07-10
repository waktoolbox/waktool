import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ListAltIcon from '@mui/icons-material/ListAlt';

import {Trans, useTranslation} from "react-i18next";
import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {getTournamentTeams} from "../../services/tournament.ts";
import {TournamentTeamModel} from "../../chore/tournament.ts";
import {useRecoilState} from "recoil";
import {teamCacheState} from "../../atoms/atoms-tournament.ts";


// TODO clean this view
export default function TournamentTeamListView() {
    const {t} = useTranslation();
    const {id} = useParams();
    const [teams, setTeams] = useState<TournamentTeamModel[]>([])
    const [teamCache, setTeamCache] = useRecoilState(teamCacheState);

    useEffect(() => {
        getTournamentTeams(id || "").then(response => {
            setTeams(response.teams || []);

            if (response.teams) {
                const ltc = new Map(teamCache);
                for (const team of response.teams) {
                    ltc.set(team.id, team.name);
                }
                setTeamCache(ltc);
            }
        })
    }, [])

    return (
        <Grid container justifyContent="center">
            <Grid item xs={12}>
                <Typography variant="h4" sx={{textTransform: "uppercase", mt: 2, mb: 3}}>
                    <b><Trans i18nKey="tournament.team.participating"
                              components={{span: <span className="blueWord"/>}}/></b>
                </Typography>
            </Grid>
            <Grid item xs={12}>
                {teams && teams.length > 0 && teams.map(team => (
                    <Card key={team.id} sx={{
                        m: 3,
                        borderRadius: 4,
                        boxShadow: '5px 5px 15px 0px #000000',
                        '.MuiCardContent-root': {p: 3}
                    }}>
                        <CardContent sx={{backgroundColor: "#162329", textAlign: "start"}}>
                            <Grid container alignItems="center">
                                <Grid item xs={12} lg={6}>
                                    <Link to={`/tournament/${id}/tab/2/team/${team.id}`}>
                                        <Typography display="inline"
                                                    variant="h6"
                                                    sx={{mr: 2}}>{team.name}</Typography>
                                        <Typography display="inline"
                                                    sx={{verticalAlign: "1px"}}><span
                                            className="blueWord">{team.server}</span></Typography>
                                    </Link>
                                </Grid>
                                <Grid item xs={12} lg={4}>
                                    <Divider sx={{
                                        mr: 2, mt: 0, mb: 0,
                                        display: {lg: "inline", xs: 'none'},
                                        pt: 2, pb: 2
                                    }}
                                             orientation="vertical" variant="middle" flexItem/>
                                    <Typography display="inline" sx={{mr: 2}}><EmojiEventsIcon
                                        sx={{
                                            verticalAlign: "middle",
                                            mr: 1,
                                            mb: '3px'
                                        }}/>{t('tournament.nbVictories', {nb: team?.stats?.victories || 0})}
                                    </Typography>
                                    <Typography display="inline"
                                                sx={{color: "#8299a1", mr: 2}}><ListAltIcon
                                        sx={{
                                            verticalAlign: "middle",
                                            mr: 1,
                                            mb: '3px'
                                        }}/>{t('tournament.nbMatchesPlayed', {nb: team?.stats?.played || 0})}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} lg={2}>
                                    <Link to={`/tournament/${id}/tab/2/team/${team.id}`}>
                                        <Button sx={{float: "right"}}>{t('tournament.team.goTo')}</Button>
                                    </Link>
                                </Grid>
                            </Grid>


                        </CardContent>
                    </Card>
                ))}
            </Grid>
        </Grid>
    )
}