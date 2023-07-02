import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {Link, useLoaderData} from "react-router-dom";
import {TournamentDefinition} from "../../chore/tournament.ts";
import {useTranslation} from "react-i18next";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {useRecoilValue} from "recoil";
import {accountCacheState} from "../../atoms/atoms-accounts.ts";
import WaktoolRichText from "../editor/WaktoolRichText.tsx";
import {myTournamentTeamState} from "../../atoms/atoms-tournament.ts";
import {loginIdState} from "../../atoms/atoms-header.ts";
import Button from "@mui/material/Button";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentInformationsView() {
    const {t} = useTranslation();
    const accounts = useRecoilValue(accountCacheState);
    const myTeam = useRecoilValue(myTournamentTeamState);
    const me = useRecoilValue(loginIdState);

    const tournament = (useLoaderData() as LoaderResponse).tournament;


    return (
        <Grid container>
            <Grid item lg={8} xs={12} sx={{textAlign: "start", pl: 4}}>
                <Stack>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mb: 2
                    }}>{t('tournament.description')}</Typography>
                    <Typography sx={{mb: 2, whiteSpace: "pre-line"}}>
                        <WaktoolRichText namespace="tournament.description" jsonText={tournament.description}/>
                    </Typography>

                    <Divider sx={{ml: -1, pr: 10, mt: 2, mb: 2}} variant="middle" flexItem/>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mb: 2
                    }}>{t('tournament.rewards')}</Typography>
                    <Typography sx={{mb: 2, whiteSpace: "pre-line"}}>
                        <WaktoolRichText namespace="tournament.rewards" jsonText={tournament.rewards}/>
                    </Typography>

                    <Divider sx={{ml: -1, mr: 3, mt: 2, mb: 2}} variant="middle" flexItem/>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mb: 2
                    }}>{t('tournament.rules')}</Typography>
                    <WaktoolRichText namespace="tournament.rules" jsonText={tournament.rules}/>
                </Stack>
            </Grid>
            <Grid item lg={4} xs={12} sx={{pl: 3, pr: 3}}>
                <Stack spacing={2}>
                    <Link to={`/tournament/${tournament.id}/tab/7`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || (myTeam && myTeam.id !== undefined) || !me}>
                        <Button sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.startRegistration')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/2/team/${myTeam?.id}`}
                          hidden={!myTeam}>
                        <Button sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.myTeam')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/8/team/${myTeam?.id}`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || !myTeam || myTeam.leader !== me}>
                        <Button sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.manageMyTeam')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/9`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || !myTeam || myTeam.leader === me}>
                        <Button sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.manageMyRegistration')}</Button>
                    </Link>
                    <Card>
                        <CardContent
                            sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                            <Typography variant="h4" sx={{
                                textAlign: "start",
                                mb: 1
                            }}>{t('tournament.admins')}</Typography>
                            {tournament.admins.map(admin => (
                                <Typography key={admin}
                                            sx={{color: "#8299a1"}}>{accounts.get(admin) || admin}</Typography>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent
                            sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                            <Typography variant="h4" sx={{
                                textAlign: "start",
                                mb: 1
                            }}>{t('tournament.referees')}</Typography>
                            {tournament.referees.map(referee => (
                                <Typography key={referee}
                                            sx={{color: "#8299a1"}}>{accounts.get(referee) || referee}</Typography>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent
                            sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                            <Typography variant="h4" sx={{
                                textAlign: "start",
                                mb: 1
                            }}>{t('tournament.streamers')}</Typography>
                            {tournament.streamers.map(streamer => (
                                <Typography key={streamer}
                                            sx={{color: "#8299a1"}}>{accounts.get(streamer) || streamer}</Typography>
                            ))}
                        </CardContent>
                    </Card>
                </Stack>
            </Grid>
        </Grid>
    )
}