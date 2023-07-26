import dayjs, {Dayjs} from 'dayjs';

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LooksOneIcon from '@mui/icons-material/LooksOne';

import {Link, useLoaderData, useNavigate, useParams} from "react-router-dom";
import {SyntheticEvent, useEffect, useState} from "react";
import {
    getMatch,
    getTeamPlayers,
    refereeRoundDraftFirstPicker,
    refereeRoundRerollMap,
    refereeRoundResetDraft,
    refereeRoundSendStats,
    refereeSetMatchDate,
    refereeSetMeAsReferee,
    refereeValidateMatchResult,
    streamerRemoveStreamer,
    streamerSetMeAsStreamer,
    teamSearch,
    userStartDraft
} from "../../services/tournament.ts";
import {
    TournamentDefinition,
    TournamentMatchHistoryEntry,
    TournamentMatchModel,
    TournamentMatchRoundModel
} from "../../chore/tournament.ts";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {myTournamentTeamState, teamCacheState} from "../../atoms/atoms-tournament.ts";
import {useTranslation} from "react-i18next";
import {dateFormat} from "../../utils/date.ts";
import {accountCacheState, streamerCacheState} from "../../atoms/atoms-accounts.ts";
import {DraftTeam} from "../../chore/draft.ts";
import {streamersLoader} from "../../services/account.ts";
import TournamentAdminDialog from "./admin/TournamentAdminDialog.tsx";
import {loginIdState} from "../../atoms/atoms-header.ts";
import {snackState} from "../../atoms/atoms-snackbar.ts";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {SelectChangeEvent} from "@mui/material/Select/SelectInput";
import {Breeds, BreedsArray} from "../../chore/breeds.ts";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentMatchView() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {id, matchId} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;

    const accounts = useRecoilValue(accountCacheState);
    const myTeam = useRecoilValue(myTournamentTeamState);
    const [teams, setTeamsCache] = useRecoilState(teamCacheState);
    const [streamerCache, setStreamerCache] = useRecoilState(streamerCacheState);
    const [teamAPlayers, setTeamAPlayers] = useState<Map<string, string>>(new Map());
    const [presentPlayers, setPresentPlayers] = useState(new Set<string>());
    const [currentHistoryEntry, setCurrentHistoryEntry] = useState<TournamentMatchHistoryEntry>({
        team: "",
        source: 0,
        target: 0
    });
    const [teamBPlayers, setTeamBPlayers] = useState<Map<string, string>>(new Map());
    const setSnackValue = useSetRecoilState(snackState);
    const me = useRecoilValue(loginIdState);

    const [tab, setTab] = useState(0);
    const [match, setMatch] = useState<TournamentMatchModel | undefined>(undefined);
    const [fight, setFight] = useState<TournamentMatchRoundModel | undefined>(undefined);

    useEffect(() => {
        if (!matchId) return;
        getMatch(id || "", matchId).then(response => {
            setFight(response.match.rounds[tab])
            setMatch(response.match);

            if (!response.match) return;
            const toLoad = []
            if (!teams.get(response.match.teamA)) toLoad.push(response.match.teamA);
            if (!teams.get(response.match.teamB)) toLoad.push(response.match.teamB);
            if (toLoad.length > 0) {
                teamSearch(id || "", toLoad).then(response => {
                    const ltc = new Map(teams);
                    for (const team of response.teams) {
                        ltc.set(team.id, team.name);
                    }
                    setTeamsCache(ltc);
                })
            }

            if (response.match?.teamA) {
                getTeamPlayers(id || "", response.match.teamA).then(response => {
                    const ltp = new Map(teamAPlayers);
                    for (const id in response.nameById) {
                        ltp.set(id, response.nameById[id]);
                    }
                    setTeamAPlayers(ltp);
                })
            }

            if (response.match?.teamB) {
                getTeamPlayers(id || "", response.match.teamB).then(response => {
                    const ltp = new Map(teamBPlayers);
                    for (const id in response.nameById) {
                        ltp.set(id, response.nameById[id]);
                    }
                    setTeamBPlayers(ltp);
                })
            }

            if (response.match?.streamer) {
                if (!streamerCache.get(response.match.streamer)) {
                    streamersLoader([response.match.streamer]).then(streamerResponse => {
                        const lc = new Map(streamerCache)
                        for (const streamer of streamerResponse.streamers) {
                            lc.set(streamer.id, streamer.twitchUrl);
                        }
                        setStreamerCache(lc)
                    })
                }
            }
        })
    }, [matchId]);

    useEffect(() => {
        setPresentPlayers(new Set([...(fight?.history?.players || [])]));
    }, [fight])

    function matchText() {
        if (!match || !tournament) return;
        const result: string[] = [];
        if (match.pool) {
            // TODO later : clean this
            result.push(t('tournament.match.pool', {pool: match.pool + (match.phase === 1 ? 1 : 0)}))
        }
        if (match.round) {
            result.push(t('tournament.match.round', {round: match.round}))
        }

        const phase = tournament.phases.find(p => p.phase === match.phase);
        if (phase) {
            const round = phase.roundModel.find(r => r.round === match.round)
            result.push(t('tournament.match.bo', {nb: round?.bo || 1}))
        }
        return result.join(" - ")
    }

    const onTabChange = (_: SyntheticEvent, newTab: number) => {
        if (!match) return;
        setFight(match.rounds[newTab])
        setTab(newTab);
    }

    function startDraft(draftTeam: DraftTeam | undefined) {
        userStartDraft(id || "", matchId || "", tab, draftTeam).then(response => {
            if (!response.id) {
                // TODO manage error
                return;
            }
            navigate(`/draft/${response.id}`)
        })
    }

    function notificationPopup(response: { success: boolean }) {
        setSnackValue({
            severity: response.success ? "info" : "error",
            message: t(response.success ? "success" : "failure") as string,
            open: true,
        })
    }

    function setMeAsReferee() {
        refereeSetMeAsReferee(id || "", matchId || "").then(response => {
            if (response.success) {
                setMatch({
                    ...match,
                    referee: me
                } as TournamentMatchModel)
            }
            notificationPopup(response)
        });
    }

    function setMeAsStreamer() {
        streamerSetMeAsStreamer(id || "", matchId || "").then(response => {
            if (response.success) {
                setMatch({
                    ...match,
                    streamer: me
                } as TournamentMatchModel)
            }
            notificationPopup(response)
        });
    }

    function removeStreamer() {
        streamerRemoveStreamer(id || "", matchId || "").then(response => {
            if (response.success) {
                setMatch({
                    ...match,
                    streamer: undefined
                } as TournamentMatchModel)
            }
            notificationPopup(response)
        });
    }

    function setAdminMatchDate(newDate: Dayjs | null) {
        setMatch({
            ...match,
            date: newDate?.toISOString()
        } as TournamentMatchModel)
    }

    function validateMatchDate() {
        refereeSetMatchDate(id || "", matchId || "", match?.date || "").then(notificationPopup);
    }

    function setMatchWinner(team: DraftTeam) {
        setMatch({
            ...match,
            winner: team === DraftTeam.TEAM_A ? match?.teamA : match?.teamB
        } as TournamentMatchModel);
    }

    function validateMatchAndSendStats() {
        refereeValidateMatchResult(id || "", matchId || "", match?.winner || "").then(notificationPopup);
    }

    function setRoundWinner(team: DraftTeam) {
        setFight({
            ...fight,
            winner: team === DraftTeam.TEAM_A ? match?.teamA : match?.teamB
        } as TournamentMatchRoundModel)
    }

    function setRoundTurns(turns: number) {
        setFight({
            ...fight,
            history: {
                ...(fight?.history || {}),
                turns: turns
            }
        } as TournamentMatchRoundModel)
    }

    function roundRerollMap() {
        refereeRoundRerollMap(id || "", matchId || "", tab).then(response => {
            notificationPopup(response);
            window.location.reload();
        });
    }

    function roundDraftFirstPicker(team: DraftTeam | undefined) {
        refereeRoundDraftFirstPicker(id || "", matchId || "", tab, team).then(response => {
            notificationPopup(response);
            window.location.reload();
        })
    }

    function roundResetDraft() {
        refereeRoundResetDraft(id || "", matchId || "", tab).then(response => {
            notificationPopup(response);
            window.location.reload();
        });
    }

    function changePresentPlayers(player: string, present: boolean) {
        const players = new Set(presentPlayers);
        if (present) players.add(player);
        else players.delete(player);
        setPresentPlayers(players);
    }

    function roundSendStats() {
        if (!fight?.history) return;
        if (!fight?.winner) return;

        const players = new Set(presentPlayers);
        if (fight.history.players) fight.history.players.forEach(p => players.add(p));

        refereeRoundSendStats(id || "", matchId || "", tab, {
            ...fight.history,
            players: [...players.keys()]
        }, fight.winner).then(response => {
            notificationPopup(response);
            window.location.reload();
        });
    }

    function addCurrentHistoryEntryToHistory() {
        setFight({
            ...fight,
            history: {
                ...fight?.history,
                entries: [
                    ...(fight?.history?.entries || []),
                    currentHistoryEntry
                ]
            }
        } as TournamentMatchRoundModel)
        setCurrentHistoryEntry({team: undefined, source: undefined, target: undefined})
    }

    // TODO externalize this
    const TeamColumn = ({fight, team}: { fight: TournamentMatchRoundModel, team: DraftTeam }) => {
        if (!match) return (<div>No match</div>);

        const appropriateTeam = team === DraftTeam.TEAM_A ? match.teamA : match.teamB;
        const appropriateDraft = team === DraftTeam.TEAM_A ? fight.teamADraft : fight.teamBDraft;
        const otherTeam = team === DraftTeam.TEAM_A ? match.teamB : match.teamA;
        return (
            <Grid item xs={6}>
                <Grid container>
                    <Grid item xs={12}>
                        {fight.winner === appropriateTeam &&
                            <EmojiEventsIcon sx={{
                                height: '60px',
                                width: '60px',
                                verticalAlign: "middle",
                                color: "#07c6b6"
                            }}/>
                        }
                        {fight.winner === otherTeam &&
                            <CancelIcon sx={{
                                height: '60px',
                                width: '60px',
                                verticalAlign: "middle",
                                color: "#e64b4b"
                            }}/>
                        }
                    </Grid>
                    <Grid item xs={12}>

                        <Link to={`/tournament/${id}/tab/2/team/${appropriateTeam}`}>
                            {fight.draftTeamA === appropriateTeam &&
                                <Tooltip title={t('tournament.match.draft.teamA')} placement="top">
                                    <LooksOneIcon sx={{verticalAlign: "middle", mb: "3px", mr: 1, color: "#8299a1"}}/>
                                </Tooltip>
                            }
                            <Typography display="inline">
                                <b>{teams.get(appropriateTeam)}</b></Typography>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sx={{p: 3}}>
                        <Grid container>
                            {appropriateDraft && appropriateDraft.pickedClasses && appropriateDraft.pickedClasses.map(c => (
                                <Grid item xs={4} key={c}>
                                    <img src={`/classes/${c}_0.png`} style={{width: "100%"}} alt={`Breed ${c}`}/>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid container sx={{p: 3}}>
                            {appropriateDraft && appropriateDraft.bannedClasses && appropriateDraft.bannedClasses.map(c => (
                                <Grid item xs={4} key={c}>
                                    <img src={`/classes/${c}_0.png`} style={{width: "100%", filter: "grayscale(1)"}}
                                         alt={`Breed ${c}`}/>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid container>
            {match && fight &&
                <>
                    <Grid item xs={12} sx={{mt: 3}}>
                        <Typography variant="h4" display="inline" sx={{color: "#fefffa"}}>
                            {match && match.winner === match.teamA &&
                                <EmojiEventsIcon sx={{
                                    mr: 1,
                                    mb: "3px",
                                    height: '80px', width: '80px',
                                    verticalAlign: "middle",
                                    color: "#07c6b6"
                                }}/>
                            }
                            {match && match.winner === match.teamB &&
                                <CancelIcon sx={{
                                    mr: 1,
                                    mb: "3px",
                                    height: '80px', width: '80px',
                                    verticalAlign: "middle",
                                    color: "#e64b4b"
                                }}/>
                            }
                            <Link to={`/tournament/${id}/tab/2/team/${match.teamA}`}>
                                {teams.get(match.teamA)}
                            </Link>
                        </Typography>
                        <Typography variant="h5" display="inline" className="blueWord"
                                    sx={{ml: 1, mr: 1}}>vs</Typography>
                        <Typography variant="h4" display="inline" sx={{color: "#fefffa"}}>
                            <Link to={`/tournament/${id}/tab/2/team/${match.teamB}`}>
                                {teams.get(match.teamB)}
                            </Link>
                            {match.winner === match.teamB &&
                                <EmojiEventsIcon sx={{
                                    ml: 1,
                                    mb: "3px",
                                    height: '80px', width: '80px',
                                    verticalAlign: "middle",
                                    color: "#07c6b6"
                                }}/>
                            }
                            {match.winner === match.teamA &&
                                <CancelIcon sx={{
                                    ml: 1,
                                    mb: "3px",
                                    height: '80px', width: '80px',
                                    verticalAlign: "middle",
                                    color: "#e64b4b"
                                }}/>
                            }
                        </Typography>
                        <Typography variant="h6" color="#8299a1">{match.date
                            ? t('date', {
                                date: Date.parse(match.date), formatParams: dateFormat
                            })
                            : t('tournament.match.noDate')}
                        </Typography>
                        <Typography sx={{
                            margin: "auto", mt: 2, mb: 3,
                            borderRadius: 3, backgroundColor: "#017d7f",
                            p: 1, pl: 3, pr: 3
                        }} display="inline-block">
                            {matchText()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, ml: 2, mr: 2}}>
                        <Tabs value={tab} onChange={onTabChange}>
                            {match.rounds && match.rounds.map((_, index) => (
                                <Tab key={index} label={t('tournament.match.matchNb', {nb: index + 1})}/>
                            ))}
                        </Tabs>
                        <Grid container>
                            <Grid item xs={8} sx={{
                                display: "flex",
                                alignItems: fight.teamADraft ? "start" : "center",
                                justifyContent: "center"
                            }}>
                                {/*TODO v2 bind draft link & draft results & winner */}
                                <Grid container>
                                    <Grid item xs={12}>
                                        {!match.done && match.date && fight.draftFirstPicker && !fight.teamADraft &&
                                            <Typography sx={{mb: 2}}
                                                        variant="h5">{t('tournament.match.draft.teamHasPriority', {team: teams.get(fight.draftFirstPicker)})}</Typography>
                                        }
                                        {!match.done && match.date && !fight.teamADraft && (!fight.draftFirstPicker || fight.draftDate) && (!fight.draftDate || fight.draftDate && Date.parse(fight.draftDate).toString() < Date.now().toString()) && (fight.draftDate || (match.teamA === myTeam?.id || match.teamB === myTeam?.id)) &&
                                            <Button sx={{width: "50%", pt: 2, pb: 2}} variant="contained"
                                                    onClick={() => startDraft(undefined)}>
                                                {t('tournament.match.draft.goTo')}
                                            </Button>
                                        }
                                        {!match.done && match.date && !fight.teamADraft && fight.draftFirstPicker && !fight.draftDate && fight.draftFirstPicker === myTeam?.id &&
                                            <>
                                                <Button sx={{width: "40%", pt: 2, pb: 2, mr: 1}} variant="contained"
                                                        onClick={() => startDraft(DraftTeam.TEAM_A)}>
                                                    {t('tournament.match.draft.goToDraftTeamA')}
                                                </Button>
                                                <Button sx={{width: "40%", pt: 2, pb: 2, ml: 1}} variant="contained"
                                                        onClick={() => startDraft(DraftTeam.TEAM_B)}>
                                                    {t('tournament.match.draft.goToDraftTeamB')}
                                                </Button>
                                            </>
                                        }
                                        {!match.done && !fight.teamADraft && !fight.draftDate &&
                                            <Typography sx={{mt: 2}}
                                                        variant="h5">{t('tournament.match.draft.notStartedYet')}</Typography>
                                        }
                                        {!match.done && !fight.teamADraft && fight.draftDate && Date.parse(fight.draftDate).toString() > Date.now().toString() &&
                                            <Typography variant="h5">{t('date', {
                                                date: Date.parse(fight.draftDate),
                                                formatParams: dateFormat
                                            })}</Typography>
                                        }
                                        {fight.teamADraft &&
                                            <Grid container>
                                                <TeamColumn fight={fight} team={DraftTeam.TEAM_A}/>
                                                <TeamColumn fight={fight} team={DraftTeam.TEAM_B}/>
                                            </Grid>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={4}>
                                {fight.teamAStats &&
                                    <Card sx={{backgroundColor: '#017d7f', borderRadius: 3, mb: 2}}>
                                        <CardContent sx={{
                                            "&:last-child": {
                                                pb: 2
                                            }
                                        }}>
                                            <Typography
                                                textAlign="start"><b>{t('tournament.match.fightTurns', {nb: fight.teamAStats.turns})}</b></Typography>
                                        </CardContent>
                                    </Card>
                                }

                                <Card sx={{backgroundColor: '#213943', borderRadius: 3, mb: 2, textAlign: "start"}}>
                                    <CardContent sx={{
                                        "&:last-child": {
                                            pb: 2
                                        }
                                    }}>
                                        <Typography variant="h5" display="inline">{t(`maps.${fight.map}`)}</Typography>
                                        <img src={`/maps/${fight.map}.jpg`} alt={`Map ${fight.map}`}
                                             style={{width: "100%", borderRadius: 6, marginTop: 8}}/>
                                    </CardContent>
                                </Card>
                                <Card sx={{backgroundColor: '#213943', borderRadius: 3, textAlign: "start", mb: 2}}>
                                    <CardContent sx={{
                                        "&:last-child": {
                                            pb: 2
                                        }
                                    }}>
                                        <Typography variant="h4"
                                                    display="inline">{t("tournament.match.live")}</Typography>
                                        <Typography
                                            sx={{
                                                color: "#8299a1",
                                                mb: 2,
                                                mt: 2
                                            }}>{match.streamer ? accounts.get(match.streamer) || match.streamer : t('tournament.match.noStreamer')}</Typography>
                                        {match.streamer && streamerCache.get(match.streamer || "") &&
                                            <a href={streamerCache.get(match.streamer || "")} rel="noreferrer"
                                               target="_blank">
                                                <Button
                                                    sx={{backgroundColor: "#6441A5", width: "100%", color: "#fefffa"}}>
                                                    <Icon sx={{mr: 1, position: "relative", top: "-2px", zIndex: 0}}>
                                                        <img style={{width: "24px", height: "30px"}}
                                                             src='/images/twitch.svg'
                                                             alt="Twitch icon"/>
                                                    </Icon>
                                                    {t('tournament.match.watchStream')}
                                                </Button>
                                            </a>
                                        }
                                        {!match.streamer && me && tournament.streamers?.find(streamer => streamer === me) && (
                                            <Button sx={{backgroundColor: "#6441A5", width: "100%", color: "#fefffa"}}
                                                    onClick={() => setMeAsStreamer()}>{t('tournament.admin.setMeAsStreamer')}</Button>
                                        )}
                                        {match.streamer && me && match?.streamer === me && (
                                            <Button sx={{width: "100%", color: "#fefffa"}} color="error"
                                                    variant="contained"
                                                    onClick={() => removeStreamer()}>{t('tournament.admin.removeMeAsStreamer')}</Button>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card sx={{backgroundColor: '#213943', borderRadius: 3, textAlign: "start", mb: 2}}>
                                    <CardContent sx={{
                                        "&:last-child": {
                                            pb: 2
                                        }
                                    }}>
                                        <Typography
                                            variant="h4">{t('tournament.match.arbitration')}</Typography>
                                        <Typography color="#8299a1"
                                                    sx={{mt: 2}}>{match.referee ? accounts.get(match.referee) || match.referee : t('tournament.match.noReferee')}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            }

            <div hidden={!(me && tournament.referees?.find(referee => referee === me))}
                 style={{position: 'fixed', bottom: 3, right: 3}}>
                <TournamentAdminDialog buttonText={t('tournament.admin.matchAdmin')}
                                       title={t('tournament.admin.matchAdmin')}>
                    <Card>
                        <CardContent>
                            <Grid container sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, mb: 1}}>
                                <Grid item xs={6}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setMeAsReferee()}>{t('tournament.admin.setMeAsReferee')}</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="contained" sx={{m: 1}} color="error"
                                            onClick={() => removeStreamer()}>{t('tournament.admin.removeStreamer')}</Button>
                                </Grid>
                                <Grid item xs={6} hidden={match?.referee !== me}>
                                    <DateTimePicker sx={{m: 1}} label={t('tournament.admin.matchDate')}
                                                    value={dayjs(match?.date)}
                                                    onChange={(newDate) => setAdminMatchDate(newDate)}
                                                    views={['year', 'day', 'hours', 'minutes', 'seconds']}/>
                                </Grid>
                                <Grid item xs={6} hidden={match?.referee !== me}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => validateMatchDate()}>{t('tournament.admin.validateMatchDate')}</Button>
                                </Grid>

                            </Grid>


                            <Grid container sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3}}
                                  hidden={match?.referee !== me}>
                                <Grid item xs={12}>
                                    <Tabs value={tab} onChange={onTabChange}>
                                        {match?.rounds?.map((_, index) => (
                                            <Tab key={index} label={t('tournament.match.matchNb', {nb: index + 1})}/>
                                        ))}
                                    </Tabs>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button variant="contained" color="error" sx={{m: 1}}
                                            onClick={() => roundDraftFirstPicker(DraftTeam.TEAM_A)}>{t('tournament.admin.draftFirstPickTeamA')}</Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button variant="contained" color="error" sx={{m: 1}}
                                            onClick={() => roundDraftFirstPicker(DraftTeam.TEAM_B)}>{t('tournament.admin.draftFirstPickTeamB')}</Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button variant="contained" color="error" sx={{m: 1}}
                                            onClick={() => roundDraftFirstPicker(DraftTeam.NONE)}>{t('tournament.admin.draftFirstPickNone')}</Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setRoundWinner(DraftTeam.TEAM_A)}>{t('tournament.admin.roundWinnerTeamA')}</Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setRoundWinner(DraftTeam.TEAM_B)}>{t('tournament.admin.roundWinnerTeamB')}</Button>
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField sx={{m: 1}} label={t('tournament.admin.roundTurnNumber')}
                                               id="catchPhrase" value={fight?.history?.turns} type="number"
                                               onChange={(newValue) => setRoundTurns(+newValue.target.value)}/>
                                </Grid>

                                <Grid item xs={12} sx={{p: 1}}>
                                    {teamAPlayers && [...teamAPlayers.keys()].map((playerId) => (
                                        <FormControlLabel key={`teamA_${playerId}`} label={teamAPlayers.get(playerId)}
                                                          control={<Checkbox checked={presentPlayers.has(playerId)}
                                                                             onChange={(e) => changePresentPlayers(playerId, e.target.checked)}/>}/>
                                    ))}
                                    {teamBPlayers && [...teamBPlayers.keys()].map((playerId) => (
                                        <FormControlLabel key={`teamB_${playerId}`} label={teamBPlayers.get(playerId)}
                                                          control={<Checkbox checked={presentPlayers.has(playerId)}
                                                                             onChange={(e) => changePresentPlayers(playerId, e.target.checked)}/>}/>
                                    ))}
                                </Grid>

                                <Grid item xs={12} hidden={!fight || !fight.teamADraft || !fight.teamBDraft}>
                                    <Select size="small" value={currentHistoryEntry.team}
                                            onChange={(event: SelectChangeEvent) => {
                                                setCurrentHistoryEntry({
                                                    ...currentHistoryEntry,
                                                    team: event.target.value
                                                })
                                            }}>
                                        <MenuItem value={match?.teamA}>{teams.get(match?.teamA || "")}</MenuItem>
                                        <MenuItem value={match?.teamB}>{teams.get(match?.teamB || "")}</MenuItem>
                                    </Select>
                                    Killer:
                                    <Select size="small" value={currentHistoryEntry.source as unknown as string}
                                            onChange={(event: SelectChangeEvent) => {
                                                setCurrentHistoryEntry({
                                                    ...currentHistoryEntry,
                                                    source: (event.target.value as unknown as number)
                                                })
                                            }}>
                                        {BreedsArray.map(breed => (
                                            <MenuItem key={`source_${breed}`} value={breed}>
                                                <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`} width={50}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    Killed:
                                    <Select size="small" value={currentHistoryEntry.target as unknown as string}
                                            onChange={(event: SelectChangeEvent) => {
                                                setCurrentHistoryEntry({
                                                    ...currentHistoryEntry,
                                                    target: (event.target.value as unknown as number)
                                                })
                                            }}>
                                        {BreedsArray.map(breed => (
                                            <MenuItem key={`source_${breed}`} value={breed}>
                                                <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`} width={50}/>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Button onClick={() => addCurrentHistoryEntryToHistory()}>Add</Button>
                                    {fight && fight.history && fight.history.entries?.map((entry, index) => (
                                        <div key={`history_${index}`}>
                                            {teams.get(entry.team || "")} {Breeds[entry.source as number]} killed {Breeds[entry.target as number]}
                                        </div>
                                    ))}
                                </Grid>

                                <Grid item xs={12}>
                                    <Button variant="contained" sx={{m: 1}} color="error"
                                            onClick={() => roundSendStats()}>{t('tournament.admin.sendFightStats')}</Button>
                                </Grid>

                                <Grid item xs={6}>
                                    <Button variant="contained" sx={{m: 1}} color="error"
                                            onClick={() => roundRerollMap()}>{t('tournament.admin.rerollMap')}</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="contained" sx={{m: 1}} color="error"
                                            onClick={() => roundResetDraft()}>{t('tournament.admin.resetDraft')}</Button>
                                </Grid>
                            </Grid>

                            <Grid container sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, mt: 2}}
                                  hidden={match?.referee !== me}>
                                <Grid item xs={6}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setMatchWinner(DraftTeam.TEAM_A)}>{t('tournament.admin.matchWinnerTeamA')}</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setMatchWinner(DraftTeam.TEAM_B)}>{t('tournament.admin.matchWinnerTeamB')}</Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" color="error" sx={{m: 1}}
                                            onClick={() => validateMatchAndSendStats()}>{t('tournament.admin.validateMatchAndSendStats')}</Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </TournamentAdminDialog>
            </div>
        </Grid>
    )
}