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
import {languageState, loginIdState} from "../../atoms/atoms-header.ts";
import Button from "@mui/material/Button";
import {useEffect, useState} from "react";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentInformationsView() {
    const {t} = useTranslation();
    const accounts = useRecoilValue(accountCacheState);
    const myTeam = useRecoilValue(myTournamentTeamState);
    const me = useRecoilValue(loginIdState);
    const language = useRecoilValue(languageState);

    const [description, setDescription] = useState("{}");
    const [rewards, setRewards] = useState("{}");
    const [rules, setRules] = useState("{}");

    useEffect(() => {
        setDescription(tournament?.description[language as any])
        setRewards(tournament?.rewards[language as any])
        setRules(tournament?.rules[language as any])
    }, [language])

    const tournament = (useLoaderData() as LoaderResponse).tournament;


    return (
        <Grid container>
            <Grid item lg={8} xs={12} sx={{textAlign: "start", pl: 4}}>
                <Stack>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mt: 1, mb: 2
                    }}>{t('tournament.description')}</Typography>
                    <Typography sx={{mb: 1, whiteSpace: "pre-line"}}>
                        <WaktoolRichText namespace="tournament.description" jsonText={description}/>
                    </Typography>

                    <Divider sx={{ml: 0, pr: 1, mt: 2, mb: 2}} variant="middle" flexItem/>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mt: 1, mb: 2
                    }}>{t('tournament.rewards')}</Typography>
                    <Typography sx={{mb: 1, whiteSpace: "pre-line"}}>
                        <WaktoolRichText namespace="tournament.rewards" jsonText={rewards}/>
                    </Typography>

                    <Divider sx={{ml: 0, mr: 0, mt: 2, mb: 2}} variant="middle" flexItem/>
                    <Typography variant="h5" sx={{
                        color: '#8299a1',
                        mt: 1, mb: 2
                    }}>{t('tournament.rules')}</Typography>
                    <Typography sx={{mb: 1, whiteSpace: "pre-line"}}>
                        <WaktoolRichText namespace="tournament.rules" jsonText={rules}/>
                    </Typography>
                </Stack>
            </Grid>
            <Grid item lg={4} xs={12} sx={{pl: 3, pr: 3}}>
                <Stack spacing={2}>
                    <Link to={`/tournament/${tournament.id}/tab/7`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || (myTeam && myTeam.id !== undefined) || !me}>
                        <Button variant="contained" sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.startRegistration')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/2/team/${myTeam?.id}`}
                          hidden={!myTeam}>
                        <Button variant="contained" sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.myTeam')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/8/team/${myTeam?.id}`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || !myTeam || myTeam.leader !== me}>
                        <Button variant="contained" sx={{
                            width: "100%",
                            pt: 1,
                            pb: 1
                        }}>{t('tournament.team.manageMyTeam')}</Button>
                    </Link>
                    <Link to={`/tournament/${tournament.id}/tab/9`}
                          hidden={Date.parse(tournament.startDate).toString() < Date.now().toString() || !myTeam || myTeam.leader === me}>
                        <Button variant="contained" sx={{
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