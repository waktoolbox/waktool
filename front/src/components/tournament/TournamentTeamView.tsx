import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HealingIcon from '@mui/icons-material/Healing';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

import {Trans, useTranslation} from "react-i18next";
import {Link, useLoaderData, useParams} from "react-router-dom";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {useEffect, useState} from "react";
import {applyToTeam, getMyTeamApplication, getTournamentTeam} from "../../services/tournament.ts";
import {TournamentDefinition, TournamentMatchModel, TournamentTeamModel} from "../../chore/tournament.ts";
import {accountCacheState} from "../../atoms/atoms-accounts.ts";
import {accountsLoader} from "../../services/account.ts";
import {myTournamentTeamState} from "../../atoms/atoms-tournament.ts";
import {loginIdState} from "../../atoms/atoms-header.ts";
import {snackState} from "../../atoms/atoms-snackbar.ts";

const defaultTeam = {
    name: "",
    catchPhrase: "",
    tournament: "",
    id: "",
    server: "",
    leader: "",
    players: [],
    displayOnTeamList: true,
    validatedPlayers: []
}

type LoaderResponse = {
    tournament: TournamentDefinition
}

// TODO clean this view
export default function TournamentTeamView() {
    const {t} = useTranslation();
    const {id, teamId} = useParams();
    const [accounts, setAccounts] = useRecoilState(accountCacheState);
    const [applyDisabled, setApplyDisabled] = useState(true);
    const setSnackValue = useSetRecoilState(snackState);

    const me = useRecoilValue(loginIdState);

    const myTeam = useRecoilValue(myTournamentTeamState);
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const isAdmin = tournament.admins.includes(me);

    const [team, setTeam] = useState<TournamentTeamModel>(defaultTeam);
    const [teamMatches, _] = useState<TournamentMatchModel[]>([]);

    useEffect(() => {
        if (!teamId) return;
        getTournamentTeam(id || "", teamId).then(response => {
            setTeam(response.team || defaultTeam);

            if (!response.team || !response.team.validatedPlayers) return;

            const toLoad = [...response.team.validatedPlayers];
            const accountsToRequest = toLoad.filter(accountId => !accounts.get(accountId));
            if (accountsToRequest.length <= 0) return;
            accountsLoader(accountsToRequest).then((response) => {
                const newCache = new Map(accounts);
                for (const account of response.accounts) {
                    newCache.set(account.id, account.displayName);
                }
                setAccounts(newCache);
            });
        })

        if (!myTeam) {
            getMyTeamApplication(id || "", teamId).then(response => {
                setApplyDisabled(response.applied);
            });
        }
    }, [teamId])

    function doApplyToTeam() {
        applyToTeam(id || "", team.id || "").then(response => {
            if (!response.success) {
                if (!response.error) return;

                setSnackValue({
                    severity: "error",
                    message: t(response.error) as string,
                    open: true
                })
                return;
            }
            setApplyDisabled(true)
        })
    }

    return (
        <Grid container>
            <Grid item lg={9} xs={12} sx={{textAlign: "start", pl: 4}}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{
                            wordWrap: "break-word",
                            mt: 5
                        }}><b>{team.name}</b></Typography>
                        <Typography variant="h5" sx={{
                            wordWrap: "break-word",
                            mt: 1
                        }}>{team.catchPhrase}</Typography>
                        <Typography sx={{
                            mt: 2, mb: 3,
                            borderRadius: 2, backgroundColor: "#017d7f",
                            width: "120px", height: "40px",
                            pl: 2, pr: 2,
                            display: "flex", flexDirection: "column", justifyContent: "center",
                            fontSize: "0.8rem", textTransform: "uppercase", textAlign: "center"
                        }}>{team.server}</Typography>

                        <Divider sx={{ml: 3, mr: 3, mt: 2, mb: 2}} variant="middle" flexItem/>

                        <Typography variant="h5"><Trans i18nKey="tournament.team.match.incomingMatches"
                                                        components={{
                                                            span: <span className="firstWord"/>
                                                        }}/></Typography>

                        {/*{teamMatches && teamMatches.filter(m => !m.done).map(match => (*/}
                        {/*    <TournamentTeamMatchView key={match.id} tournamentId={id || ""}*/}
                        {/*                             match={match}*/}
                        {/*                             displayedTeam={team.id}*/}
                        {/*                             otherTeamName={teamsNamesPersistence.get(match.teamA === team.id ? match.teamB : match.teamA) || ""}*/}
                        {/*                             goToMatch={() => loadMatch(match.id, true)}/>*/}
                        {/*))}*/}

                        {teamMatches && teamMatches.filter(m => !m.done).length <= 0 &&
                            <Typography sx={{ml: 2, mt: 2}}
                                        variant="h6">{t('tournament.team.match.noNextMatches')}</Typography>
                        }

                        <Divider sx={{ml: 3, mr: 3, mt: 2, mb: 2}} variant="middle" flexItem/>

                        <Typography variant="h5"
                                    sx={{color: "#fefffa"}}>{t('tournament.team.match.results')}</Typography>

                        {/*{teamMatches && teamMatches.length > 0 && teamMatches.filter(m => m.done).map(match => (*/}
                        {/*    <TournamentTeamMatchView key={match.id} tournamentId={id || ""}*/}
                        {/*                             match={match}*/}
                        {/*                             displayedTeam={team.id}*/}
                        {/*                             otherTeamName={teamsNamesPersistence.get(match.teamA === team.id ? match.teamB : match.teamA) || ""}*/}
                        {/*                             goToMatch={() => loadMatch(match.id, true)}/>*/}
                        {/*))}*/}

                        {teamMatches && teamMatches.filter(m => m.done).length <= 0 &&
                            <Typography sx={{ml: 2, mt: 2}}
                                        variant="h6">{t('tournament.team.match.noMatchResult')}</Typography>
                        }
                    </Grid>
                </Grid>
            </Grid>
            <Grid item lg={3} xs={12} sx={{pl: 3, pr: 3}}>
                <Stack spacing={2}>
                    {me && (Date.parse(tournament.startDate).toString() > Date.now().toString() || isAdmin) && (
                        <Card>
                            <CardContent sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                                <Button sx={{width: '100%'}} onClick={() => doApplyToTeam()}
                                        disabled={(myTeam !== undefined && myTeam !== null) || applyDisabled}>{t('tournament.team.apply')}</Button>
                                {((myTeam && myTeam.leader === me && team.id === myTeam.id) || isAdmin) && (
                                    <Link to={`/tournament/${tournament.id}/tab/8/team/${team.id}`}>
                                        <Button sx={{width: '100%'}}>{t('tournament.team.manage')}</Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent
                            sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                            <Typography sx={{color: "#8299a1", mr: 2}}><ListAltIcon
                                sx={{
                                    verticalAlign: "middle",
                                    mr: 1,
                                    mb: '3px'
                                }}/>{t('tournament.nbMatchesPlayed', {nb: team?.stats?.played || 0})}
                            </Typography>
                            <Typography sx={{mr: 2, color: "#07c6b6"}}>
                                <EmojiEventsIcon sx={{
                                    verticalAlign: "middle",
                                    mr: 1,
                                    mb: '3px'
                                }}/>{t('tournament.nbVictories', {nb: team?.stats?.played || 0})}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent
                            sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                            <Typography variant="h4" sx={{
                                textAlign: "start",
                                mb: 1
                            }}>{t('tournament.team.members')}</Typography>
                            {team.validatedPlayers.map(player => (
                                <Typography key={player} sx={{color: "#8299a1"}}>
                                    {accounts.get(player) || player}
                                </Typography>
                            ))}
                        </CardContent>
                    </Card>
                    {team && team.stats && team.stats.statsByClass && team.stats.statsByClass.filter(b => b).length > 0 &&
                        <Card>
                            <CardContent
                                sx={{backgroundColor: '#213943', textAlign: "start", pl: 3}}>
                                <Grid container>
                                    {team.stats.statsByClass.filter(b => b).map(breed => (
                                        <Grid item xs={4} lg={12} key={breed.id}>
                                            <Grid container alignItems="center">
                                                <Grid item xs={4}>
                                                    <img src={`/classes/${breed.id}_0.png`}
                                                         style={{width: "100%"}}
                                                         alt={`Breed ${breed.id}`}/>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <Tooltip
                                                        title={t('tournament.team.match.stats.played')}
                                                        placement="top">
                                                        <Typography
                                                            display={breed.played ? "inline" : "none"}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                color: '#4be64b',
                                                                ml: 1
                                                            }}>
                                                            <VideogameAssetIcon sx={{
                                                                verticalAlign: "middle",
                                                                mb: "3px"
                                                            }}/> {breed.played}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={t('tournament.team.match.stats.banned')}
                                                        placement="top">
                                                        <Typography
                                                            display={breed.banned ? "inline" : "none"}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                color: '#e64b4b',
                                                                ml: 1
                                                            }}>
                                                            <VideogameAssetOffIcon sx={{
                                                                verticalAlign: "middle",
                                                                mb: "3px"
                                                            }}/> {breed.banned}
                                                        </Typography>
                                                    </Tooltip>
                                                    <br/>
                                                    <Tooltip
                                                        title={t('tournament.team.match.stats.victories')}
                                                        placement="top">
                                                        <Typography
                                                            display={breed.victories ? "inline" : "none"}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                color: '#07c6b6',
                                                                ml: 1
                                                            }}>
                                                            <EmojiEventsIcon sx={{
                                                                verticalAlign: "middle",
                                                                mb: "3px"
                                                            }}/> {breed.victories}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={t('tournament.team.match.stats.killed')}
                                                        placement="top">
                                                        <Typography
                                                            display={breed.killed ? "inline" : "none"}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                color: '#C50756',
                                                                ml: 1
                                                            }}>
                                                            <SportsMmaIcon sx={{
                                                                verticalAlign: "middle",
                                                                mb: "3px"
                                                            }}/> {breed.killed}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={t('tournament.team.match.stats.death')}
                                                        placement="top">
                                                        <Typography
                                                            display={breed.death ? "inline" : "none"}
                                                            sx={{
                                                                verticalAlign: "middle",
                                                                color: "#8299a1",
                                                                ml: 1
                                                            }}>
                                                            <HealingIcon sx={{
                                                                verticalAlign: "middle",
                                                                mb: "3px"
                                                            }}/> {breed.death}
                                                        </Typography>
                                                    </Tooltip>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    }
                </Stack>
            </Grid>
        </Grid>
    )
}