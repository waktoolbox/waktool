import dayjs, {Dayjs} from 'dayjs';

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import {Link, useLoaderData, useNavigate, useParams} from "react-router-dom";
import {SyntheticEvent, useEffect, useState} from "react";
import {
    getMatch,
    getMatchReports,
    getTeamPlayers,
    refereeRoundDraftFirstPicker,
    refereeRoundRerollMap,
    refereeRoundResetDraft,
    refereeRoundSendStats,
    refereeSetMatchDate,
    refereeSetMeAsReferee,
    refereeSetRoundDates,
    refereeValidateMatchResult,
    reportRoundResult,
    streamerRemoveStreamer,
    streamerSetMeAsStreamer,
    teamSearch,
    userStartDraft
} from "../../services/tournament.ts";
import {
    MatchReportModel,
    TournamentDefinition,
    TournamentMatchHistoryEntry,
    TournamentMatchModel,
    TournamentMatchRoundModel
} from "../../chore/tournament.ts";
import {useAtomState, useAtomValue} from "@zedux/react";
import {teamCacheState} from "../../atoms/atoms-tournament.ts";
import {useTranslation} from "react-i18next";
import {dateFormat} from "../../utils/date.ts";
import {streamerCacheState} from "../../atoms/atoms-accounts.ts";
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
import {User} from "../common/User.tsx";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentMatchView() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {id, matchId} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;


    const [teams, setTeamsCache] = useAtomState(teamCacheState);
    const [streamerCache, setStreamerCache] = useAtomState(streamerCacheState);
    const [teamAPlayers, setTeamAPlayers] = useState<Map<string, string>>(new Map());
    const [presentPlayers, setPresentPlayers] = useState(new Set<string>());
    const [currentHistoryEntry, setCurrentHistoryEntry] = useState<TournamentMatchHistoryEntry>({
        team: "",
        source: 0,
        target: 0
    });
    const [teamBPlayers, setTeamBPlayers] = useState<Map<string, string>>(new Map());
    const [, setSnackValue] = useAtomState(snackState);
    const me = useAtomValue(loginIdState);

    const [tab, setTab] = useState(0);
    const [match, setMatch] = useState<TournamentMatchModel | undefined>(undefined);
    const [fight, setFight] = useState<TournamentMatchRoundModel | undefined>(undefined);

    // Match report state
    const [matchReports, setMatchReports] = useState<MatchReportModel[]>([]);
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>(undefined);
    const [screenshotName, setScreenshotName] = useState<string | undefined>(undefined);
    const [screenshotCleared, setScreenshotCleared] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState<string | undefined>(undefined);
    const [disputeText, setDisputeText] = useState("");

    const [roundDraftDate, setRoundDraftDate] = useState<Dayjs | null>(null);
    const [roundDraftJoinDeadline, setRoundDraftJoinDeadline] = useState<Dayjs | null>(null);
    const [roundMatchStartDeadline, setRoundMatchStartDeadline] = useState<Dayjs | null>(null);

    useEffect(() => {
        if (!matchId) return;
        getMatch(id || "", matchId).then(response => {
            setFight(response.match.rounds?.[tab])
            setMatch(response.match);

            if (!response.match) return;
            const toLoad = []
            if (response.match.teamA && !teams.get(response.match.teamA)) toLoad.push(response.match.teamA);
            if (response.match.teamB && !teams.get(response.match.teamB)) toLoad.push(response.match.teamB);
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
        setRoundDraftDate(fight?.draftDate ? dayjs(fight.draftDate) : null);
        setRoundDraftJoinDeadline(fight?.draftJoinDeadline ? dayjs(fight.draftJoinDeadline) : null);
        setRoundMatchStartDeadline(fight?.matchStartDeadline ? dayjs(fight.matchStartDeadline) : null);
    }, [fight])

    useEffect(() => {
        if (!id || !matchId || !match) return;
        if (isAutoRefereeing) {
            getMatchReports(id, matchId).then(response => {
                if (response?.reports) setMatchReports(response.reports);
            });
        }
    }, [match, id, matchId, tab])

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

    function validateRoundDates() {
        refereeSetRoundDates(
            id || "",
            matchId || "",
            tab,
            roundDraftDate?.toISOString(),
            roundDraftJoinDeadline?.toISOString(),
            roundMatchStartDeadline?.toISOString()
        ).then(response => {
            if (response.success) {
                const updatedRounds = match?.rounds.map((r, idx) => {
                    if (idx === tab) {
                        return {
                            ...r,
                            draftDate: roundDraftDate?.toISOString(),
                            draftJoinDeadline: roundDraftJoinDeadline?.toISOString(),
                            matchStartDeadline: roundMatchStartDeadline?.toISOString()
                        };
                    }
                    return r;
                });
                setMatch({
                    ...match,
                    rounds: updatedRounds
                } as TournamentMatchModel);
                setFight({
                    ...fight,
                    draftDate: roundDraftDate?.toISOString(),
                    draftJoinDeadline: roundDraftJoinDeadline?.toISOString(),
                    matchStartDeadline: roundMatchStartDeadline?.toISOString()
                } as TournamentMatchRoundModel);
            }
            notificationPopup(response);
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

    // === Auto-refereeing helpers ===
    const currentPhase = match ? tournament.phases.find(p => p.phase === match.phase) : undefined;
    const isAutoRefereeing = currentPhase?.autoRefereeing ?? false;
    const isRefereeOrAdmin = !!(me && (tournament.referees?.includes(me) || tournament.admins?.includes(me)));
    const myTeamSide = me && match ? (teamAPlayers.has(me) ? "A" : teamBPlayers.has(me) ? "B" : null) : null;
    const isTeamMember = myTeamSide !== null;
    const isPriorityTeam = !!(myTeamSide && fight && (
        (myTeamSide === "A" && fight.draftFirstPicker === match?.teamA) ||
        (myTeamSide === "B" && fight.draftFirstPicker === match?.teamB)
    ));
    const matchDatePassed = match?.date ? Date.parse(match.date) < Date.now() : false;

    const currentReport = matchReports.find(r => r.round === tab);
    const myReportedWinner = myTeamSide === "A" ? currentReport?.teamAReportedWinner : currentReport?.teamBReportedWinner;
    const opponentReportedWinner = myTeamSide === "A" ? currentReport?.teamBReportedWinner : currentReport?.teamAReportedWinner;
    const myScreenshot = myTeamSide === "A" ? currentReport?.teamAScreenshot : currentReport?.teamBScreenshot;
    const bothReported = !!(currentReport?.teamAReportedWinner && currentReport?.teamBReportedWinner);
    const bothAgree = bothReported && currentReport?.teamAReportedWinner === currentReport?.teamBReportedWinner;
    const isDisputed = currentReport?.disputed ?? false;
    const wouldDispute = !!(opponentReportedWinner && selectedWinner && selectedWinner !== opponentReportedWinner);
    const showDisputeField = isDisputed || wouldDispute;

    // Pre-fill form when reports and team side are both available
    useEffect(() => {
        if (!myTeamSide || matchReports.length === 0) return;
        const report = matchReports.find(r => r.round === tab);
        if (!report) return;
        const winner = myTeamSide === "A" ? report.teamAReportedWinner : report.teamBReportedWinner;
        const explanation = myTeamSide === "A" ? report.teamADisputeExplanation : report.teamBDisputeExplanation;
        if (winner) setSelectedWinner(winner);
        setDisputeText(explanation || "");
        setScreenshotCleared(false);
        setScreenshotBase64(undefined);
        setScreenshotName(undefined);
    }, [matchReports, myTeamSide, tab])

    function loadReports() {
        if (!id || !matchId) return;
        getMatchReports(id, matchId).then(response => {
            if (response?.reports) setMatchReports(response.reports);
        });
    }

    const effectiveScreenshot = screenshotBase64 || (myScreenshot && !screenshotCleared ? myScreenshot : undefined);

    function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) { setScreenshotBase64(undefined); setScreenshotName(undefined); return; }
        if (file.size > 5 * 1024 * 1024) {
            setSnackValue({ severity: "error", message: t('tournament.match.report.screenshotTooBig') as string, open: true });
            e.target.value = "";
            return;
        }
        setScreenshotName(file.name);
        setScreenshotCleared(false);
        const reader = new FileReader();
        reader.onload = () => setScreenshotBase64(reader.result as string);
        reader.readAsDataURL(file);
    }

    function clearScreenshot() {
        setScreenshotBase64(undefined);
        setScreenshotName(undefined);
        setScreenshotCleared(true);
    }

    function submitReport() {
        if (!id || !matchId || !selectedWinner || reportSubmitting) return;
        setReportSubmitting(true);
        // Send undefined when user didn't change the screenshot so backend preserves it
        const screenshotToSend = screenshotCleared ? "" : (screenshotBase64 || undefined);
        reportRoundResult(id, matchId, tab, selectedWinner, screenshotToSend, disputeText || undefined).then(response => {
            notificationPopup(response);
            setReportSubmitting(false);
            loadReports();
        });
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
                        {fight.winner && fight.winner === appropriateTeam &&
                            <EmojiEventsIcon sx={{
                                height: '60px',
                                width: '60px',
                                verticalAlign: "middle",
                                color: "#07c6b6"
                            }}/>
                        }
                        {fight.winner && fight.winner === otherTeam &&
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
                            {fight.draftTeamA && fight.draftTeamA === appropriateTeam &&
                                <Tooltip title={t('tournament.match.draft.teamA')} placement="top">
                                    <LooksOneIcon sx={{verticalAlign: "middle", mb: "3px", mr: 1, color: "#8299a1"}}/>
                                </Tooltip>
                            }
                            <Typography display="inline">
                                <b>{teams.get(appropriateTeam)}</b></Typography>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sx={{px: 2, pt: 2}}>
                        <Grid container spacing={1} sx={{justifyContent: 'center'}}>
                            {appropriateDraft && appropriateDraft.pickedClasses && appropriateDraft.pickedClasses.map(c => (
                                <Grid item xs={3} key={c} sx={{display: 'flex', justifyContent: 'center'}}>
                                    <img src={`/classes/${c}_0.png`} style={{width: "100%", maxWidth: 80, borderRadius: 6}} alt={`Breed ${c}`}/>
                                </Grid>
                            ))}
                        </Grid>
                        <Grid container spacing={1} sx={{mt: 1, justifyContent: 'center'}}>
                            {appropriateDraft && appropriateDraft.bannedClasses && appropriateDraft.bannedClasses.map(c => (
                                <Grid item xs={3} key={c} sx={{display: 'flex', justifyContent: 'center'}}>
                                    <img src={`/classes/${c}_0.png`} style={{width: "100%", maxWidth: 64, filter: "grayscale(1)", opacity: 0.7, borderRadius: 6}}
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
            {match &&
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
                            {match && match.teamB && match.winner === match.teamB &&
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
                        {match.teamB ? (
                            <>
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
                            </>
                        ) : (
                            <Typography variant="h5" display="inline" className="blueWord"
                                        sx={{ml: 1}}>— {t('bracket.noOpponent')}</Typography>
                        )}
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
                    {match.rounds && match.rounds.length > 0 && fight ? (
                    <Grid item xs={12} sx={{pr: 2, backgroundColor: '#162329', borderRadius: 3, ml: 2, mr: 2, pb: 1}}>
                        <Tabs value={tab} onChange={onTabChange}>
                            {match.rounds && match.rounds.map((_, index) => (
                                <Tab key={index} label={t('tournament.match.matchNb', {nb: index + 1})}/>
                            ))}
                        </Tabs>
                        <Grid container>
                            <Grid item xs={8}>
                                {/*TODO v2 bind draft link & draft results & winner */}
                                <Grid container sx={{
                                    textAlign: "center",
                                    justifyContent: "center",
                                    alignItems: fight.teamADraft ? "start" : "center",
                                    minHeight: fight.teamADraft ? undefined : 200
                                }}>
                                    <Grid item xs={12}>
                                        {!match.done && match.date && fight.draftFirstPicker && !fight.teamADraft &&
                                            <Typography sx={{mb: 2}}
                                                        variant="h5">{t('tournament.match.draft.teamHasPriority', {team: teams.get(fight.draftFirstPicker)})}</Typography>
                                        }
                                        {!match.done && match.date && !fight.teamADraft && (!fight.draftFirstPicker || fight.draftDate) && (!fight.draftDate || fight.draftDate && Date.parse(fight.draftDate).toString() < Date.now().toString()) && (!fight.draftFirstPicker || fight.draftTeamA) &&
                                            <Button sx={{width: "50%", pt: 2, pb: 2}} variant="contained"
                                                    onClick={() => startDraft(undefined)}>
                                                {t('tournament.match.draft.goTo')}
                                            </Button>
                                        }
                                        {!match.done && match.date && !fight.teamADraft && fight.draftFirstPicker && !fight.draftTeamA && isPriorityTeam &&
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

                                {/* Auto-refereeing: Player report section — hidden while a required draft is not completed */}
                                {isAutoRefereeing && isTeamMember && !match.done && matchDatePassed && !fight.winner && (!fight.draftId || fight.teamADraft) &&
                                    <Card sx={{backgroundColor: '#213943', borderRadius: 3, mt: 2, mx: 1}}>
                                        <CardContent sx={{p: 2, "&:last-child": {pb: 2}}}>
                                            <Typography variant="h6" sx={{mb: 2}}>{t('tournament.match.report.title')}</Typography>

                                            {/* Unified status block */}
                                            {(myReportedWinner || opponentReportedWinner) && (() => {
                                                const bgColor = isDisputed ? '#2b1a1a' : bothAgree ? '#0d2b2b' : '#1a2e38';
                                                const textColor = isDisputed ? '#e64b4b' : bothAgree ? '#07c6b6' : '#8299a1';
                                                const StatusIcon = isDisputed ? WarningAmberIcon : bothAgree ? CheckCircleIcon : HourglassEmptyIcon;

                                                let statusLabel = '';
                                                if (isDisputed) statusLabel = t('tournament.match.report.disputed') as string;
                                                else if (bothAgree) statusLabel = t('tournament.match.report.bothAgree') as string;
                                                else if (myReportedWinner && !opponentReportedWinner) statusLabel = t('tournament.match.report.waitingForOpponent') as string;
                                                else if (!myReportedWinner && opponentReportedWinner) statusLabel = t('tournament.match.report.opponentHasReported') as string;

                                                let summaryText = '';
                                                if (myReportedWinner && opponentReportedWinner) {
                                                    summaryText = t('tournament.match.report.reportSummaryBoth', {
                                                        myTeam: teams.get(myReportedWinner) || myReportedWinner,
                                                        opponentTeam: teams.get(opponentReportedWinner) || opponentReportedWinner
                                                    }) as string;
                                                } else if (myReportedWinner) {
                                                    summaryText = t('tournament.match.report.reportSummaryMine', {
                                                        team: teams.get(myReportedWinner) || myReportedWinner
                                                    }) as string;
                                                } else if (opponentReportedWinner) {
                                                    summaryText = t('tournament.match.report.reportSummaryOpponent', {
                                                        team: teams.get(opponentReportedWinner) || opponentReportedWinner
                                                    }) as string;
                                                }

                                                return (
                                                    <Box sx={{mb: 2, p: 1.5, borderRadius: 1, backgroundColor: bgColor, textAlign: 'center'}}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1}}>
                                                            <StatusIcon sx={{color: textColor, fontSize: '1.2rem'}}/>
                                                            <Typography variant="body2" sx={{color: textColor, fontWeight: 500}}>{statusLabel}</Typography>
                                                        </Box>
                                                        {summaryText && (
                                                            <Typography variant="body2" sx={{color: textColor, mt: 0.5, opacity: 0.85}}>
                                                                {summaryText}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                );
                                            })()}

                                            {/* Winner selection */}
                                            <Typography variant="body2" sx={{mb: 1, fontWeight: 500}}>{t('tournament.match.report.selectWinner')}</Typography>
                                            <ButtonGroup fullWidth sx={{mb: 2}}>
                                                <Button
                                                    variant={selectedWinner === match.teamA ? "contained" : "outlined"}
                                                    onClick={() => setSelectedWinner(match.teamA)}
                                                    sx={selectedWinner === match.teamA ? {backgroundColor: '#017d7f', '&:hover': {backgroundColor: '#015d5f'}} : {}}
                                                >
                                                    {teams.get(match.teamA) || match.teamA}
                                                </Button>
                                                <Button
                                                    variant={selectedWinner === match.teamB ? "contained" : "outlined"}
                                                    onClick={() => setSelectedWinner(match.teamB)}
                                                    sx={selectedWinner === match.teamB ? {backgroundColor: '#017d7f', '&:hover': {backgroundColor: '#015d5f'}} : {}}
                                                >
                                                    {teams.get(match.teamB) || match.teamB}
                                                </Button>
                                            </ButtonGroup>

                                            {/* Screenshot upload */}
                                            <Typography variant="body2" sx={{mb: 1, fontWeight: 500}}>{t('tournament.match.report.screenshot')} *</Typography>
                                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2}}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    component="label"
                                                    startIcon={<AttachFileIcon/>}
                                                    sx={{textTransform: 'none'}}
                                                >
                                                    {screenshotName || t('tournament.match.report.chooseFile')}
                                                    <input type="file" hidden accept="image/jpeg,image/png" onChange={handleScreenshotChange}/>
                                                </Button>
                                                {(effectiveScreenshot) && (
                                                    <Tooltip
                                                        title={<img src={effectiveScreenshot} alt="Preview" style={{maxWidth: 854, maxHeight: 480, borderRadius: 4}}/>}
                                                        placement="top"
                                                        arrow
                                                    >
                                                        <VisibilityIcon sx={{color: '#8299a1', cursor: 'pointer', fontSize: '1.3rem'}}/>
                                                    </Tooltip>
                                                )}
                                                {effectiveScreenshot && (
                                                    <IconButton size="small" color="error"
                                                            onClick={() => clearScreenshot()}>
                                                        <DeleteIcon sx={{fontSize: '1.2rem'}}/>
                                                    </IconButton>
                                                )}
                                            </Box>

                                            {/* Dispute explanation — inline when disputed or would dispute */}
                                            {showDisputeField && (
                                                <Box sx={{mb: 2}}>
                                                    {wouldDispute && !isDisputed && (
                                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, p: 1, borderRadius: 1, backgroundColor: '#2b1a1a'}}>
                                                            <WarningAmberIcon sx={{color: '#e64b4b', fontSize: '1.2rem'}}/>
                                                            <Typography variant="body2" sx={{color: '#e64b4b', fontWeight: 500}}>
                                                                {t('tournament.match.report.willDispute')}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Typography variant="body2" sx={{mb: 1, fontWeight: 500}}>{t('tournament.match.report.addExplanation')}</Typography>
                                                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                                                        <TextField
                                                            multiline rows={2} fullWidth size="small"
                                                            placeholder={t('tournament.match.report.explanationPlaceholder') as string}
                                                            value={disputeText}
                                                            onChange={(e) => setDisputeText(e.target.value)}
                                                        />
                                                        {disputeText && (
                                                            <IconButton size="small" color="error"
                                                                    onClick={() => setDisputeText("")}
                                                                    sx={{mt: 0.5}}>
                                                                <DeleteIcon sx={{fontSize: '1.2rem'}}/>
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Submit button */}
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={!selectedWinner || !effectiveScreenshot || reportSubmitting}
                                                onClick={() => submitReport()}
                                                endIcon={<SendIcon/>}
                                                sx={{backgroundColor: '#017d7f', '&:hover': {backgroundColor: '#015d5f'}}}
                                            >
                                                {t('tournament.match.report.submit')}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                }

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

                                {(fight.draftDate || fight.draftJoinDeadline || fight.matchStartDeadline) && (
                                    <Card sx={{backgroundColor: '#213943', borderRadius: 3, mb: 2, textAlign: "start"}}>
                                        <CardContent sx={{"&:last-child": {pb: 2}}}>
                                            <Typography variant="h6" sx={{mb: 1}}>{t('tournament.match.roundDates.title')}</Typography>
                                            {fight.draftDate && (
                                                <Typography variant="body2" sx={{color: '#8299a1', mb: 0.5}}>
                                                    {t('tournament.match.roundDates.draftStart')}: {t('date', {date: Date.parse(fight.draftDate), formatParams: dateFormat})}
                                                </Typography>
                                            )}
                                            {fight.draftJoinDeadline && (
                                                <Tooltip title={t('tournament.match.roundDates.joinDeadlineTooltip')} placement="top">
                                                    <Typography variant="body2" sx={{color: '#8299a1', mb: 0.5}}>
                                                        {t('tournament.match.roundDates.draftJoinDeadline')}: {t('date', {date: Date.parse(fight.draftJoinDeadline), formatParams: dateFormat})}
                                                    </Typography>
                                                </Tooltip>
                                            )}
                                            {fight.matchStartDeadline && (
                                                <Typography variant="body2" sx={{color: '#8299a1'}}>
                                                    {t('tournament.match.roundDates.matchStartDeadline')}: {t('date', {date: Date.parse(fight.matchStartDeadline), formatParams: dateFormat})}
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                                <Card sx={{backgroundColor: '#213943', borderRadius: 3, textAlign: "start", mb: 2}}>
                                    <CardContent sx={{
                                        "&:last-child": {
                                            pb: 2
                                        }
                                    }}>
                                        <Typography variant="h4"
                                                    display="inline">{t("tournament.match.live")}</Typography>

                                        {match.streamer ?
                                            <User userId={match.streamer}
                                                  otherProps={{sx: {color: "#8299a1", mb: 2, mt: 2}}}/>
                                            : <Typography
                                                sx={{
                                                    color: "#8299a1",
                                                    mb: 2,
                                                    mt: 2
                                                }}>{t('tournament.match.noStreamer')}</Typography>
                                        }
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
                                        {!match.streamer &&
                                            <a href='https://www.twitch.tv/directory/category/wakfu' rel="noreferrer"
                                               target="_blank">
                                                <Button
                                                    sx={{backgroundColor: "#6441A5", width: "100%", color: "#fefffa"}}>
                                                    <Icon sx={{mr: 1, position: "relative", top: "-2px", zIndex: 0}}>
                                                        <img style={{width: "24px", height: "30px"}}
                                                             src='/images/twitch.svg'
                                                             alt="Twitch icon"/>
                                                    </Icon>
                                                    {t('tournament.match.findAStream')}
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
                                        {match.referee ?
                                            <User userId={match.referee} otherProps={{sx: {color: "#8299a1"}}}/>
                                            :
                                            <Typography color="#8299a1"
                                                        sx={{mt: 2}}>{t('tournament.match.noReferee')}</Typography>
                                        }
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                    ) : (
                    <Grid item xs={12} sx={{backgroundColor: '#162329', borderRadius: 3, ml: 2, mr: 2, pb: 2, pt: 2, textAlign: 'center'}}>
                        <EmojiEventsIcon sx={{height: '60px', width: '60px', color: '#07c6b6', mb: 1}}/>
                        <Typography variant="h6" sx={{color: '#8299a1'}}>
                            {match.winner
                                ? t('tournament.match.byeWinner', {team: teams.get(match.winner) || match.winner})
                                : t('bracket.noOpponent')
                            }
                        </Typography>
                        {match.done && (
                            <Typography variant="body2" sx={{color: '#5a7a84', mt: 1}}>
                                {t('tournament.match.byeDescription')}
                            </Typography>
                        )}
                    </Grid>
                    )}
                </>
            }

            <div hidden={!(me && (tournament.referees?.find(referee => referee === me) || tournament.admins?.find(admin => admin === me)))}
                 style={{position: 'fixed', bottom: 3, right: 3}}>
                <TournamentAdminDialog buttonText={t('tournament.admin.matchAdmin')} withTitle={false}
                                       title={""}>
                    <Card>
                        <CardContent sx={{m: 1, borderRadius: 3}}>

                            {/* ── Section: General ── */}
                            <Typography variant="h6" sx={{mb: 1}}>{t('tournament.admin.sectionGeneral')}</Typography>
                            <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329'}}>
                                <Grid item xs={12}>
                                    <Button variant="outlined" sx={{m: 1}}
                                            onClick={() => setMeAsReferee()}>{t('tournament.admin.setMeAsReferee')}</Button>
                                    <Button variant="contained" sx={{m: 1}} color="error"
                                            onClick={() => removeStreamer()}>{t('tournament.admin.removeStreamer')}</Button>
                                </Grid>
                            </Grid>

                            {/* ── Section: Match date ── */}
                            <div hidden={!isRefereeOrAdmin}>
                                <Typography variant="h6" sx={{mb: 1}}>{t('tournament.admin.sectionMatchDate')}</Typography>
                                <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329', alignItems: 'center'}}>
                                    <Grid item xs={6}>
                                        <DateTimePicker sx={{m: 1}} label={t('tournament.admin.matchDate')}
                                                        value={dayjs(match?.date)}
                                                        onChange={(newDate) => setAdminMatchDate(newDate)}
                                                        views={['year', 'day', 'hours', 'minutes', 'seconds']}/>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button variant="outlined" sx={{m: 1}}
                                                onClick={() => validateMatchDate()}>{t('tournament.admin.validateMatchDate')}</Button>
                                    </Grid>
                                </Grid>
                            </div>

                            {/* ── Section: Round selector ── */}
                            <div hidden={!isRefereeOrAdmin}>
                                <Typography variant="h6" sx={{mb: 1}}>{t('tournament.admin.sectionRoundManagement')}</Typography>
                                <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329'}}>
                                    <Grid item xs={12}>
                                        <Tabs value={tab} onChange={onTabChange}>
                                            {match?.rounds?.map((_, index) => (
                                                <Tab key={index} label={t('tournament.match.matchNb', {nb: index + 1})}/>
                                            ))}
                                        </Tabs>
                                    </Grid>
                                </Grid>

                                {/* ── Sub-section: Round dates ── */}
                                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 500, color: '#8299a1'}}>{t('tournament.match.roundDates.title')}</Typography>
                                <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329', alignItems: 'center'}}>
                                    <Grid item xs={4}>
                                        <DateTimePicker sx={{m: 1}} label={t('tournament.match.roundDates.draftStart')}
                                                        value={roundDraftDate}
                                                        onChange={(newDate) => setRoundDraftDate(newDate)}
                                                        views={['year', 'day', 'hours', 'minutes', 'seconds']}/>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <DateTimePicker sx={{m: 1}} label={t('tournament.match.roundDates.draftJoinDeadline')}
                                                        value={roundDraftJoinDeadline}
                                                        onChange={(newDate) => setRoundDraftJoinDeadline(newDate)}
                                                        views={['year', 'day', 'hours', 'minutes', 'seconds']}/>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <DateTimePicker sx={{m: 1}} label={t('tournament.match.roundDates.matchStartDeadline')}
                                                        value={roundMatchStartDeadline}
                                                        onChange={(newDate) => setRoundMatchStartDeadline(newDate)}
                                                        views={['year', 'day', 'hours', 'minutes', 'seconds']}/>
                                    </Grid>
                                    <Grid item xs={12} sx={{textAlign: 'right', mt: 1}}>
                                        <Button variant="outlined" sx={{m: 1}}
                                                onClick={() => validateRoundDates()}>{t('tournament.admin.validateRoundDates')}</Button>
                                    </Grid>
                                </Grid>

                                {/* ── Sub-section: Draft management ── */}
                                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 500, color: '#8299a1'}}>{t('tournament.admin.sectionDraft')}</Typography>
                                <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329', alignItems: 'center'}}>
                                    {/* Current round context */}
                                    <Grid item xs={12} sx={{mb: 1, p: 1, backgroundColor: '#0f1c22', borderRadius: 1}}>
                                        <Typography variant="body2" sx={{color: '#07c6b6'}}>
                                            {t('tournament.match.matchNb', {nb: tab + 1})} — {t(`maps.${fight?.map}`)}
                                            {fight?.winner && ` — ${t('tournament.admin.roundWinner')}: ${teams.get(fight.winner) || fight.winner}`}
                                        </Typography>
                                    </Grid>

                                    {/* Draft first picker */}
                                    <Grid item xs={3}>
                                        <Typography sx={{ml: 1, mt: 1}}
                                                    display="inline">{t('tournament.admin.draftFirstPickTeam')}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Button variant="contained" color="error" sx={{m: 1}}
                                                onClick={() => roundDraftFirstPicker(DraftTeam.TEAM_A)}>{(match?.teamA && teams.get(match.teamA)) || t('tournament.admin.teamA')}</Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Button variant="contained" color="error" sx={{m: 1}}
                                                onClick={() => roundDraftFirstPicker(DraftTeam.TEAM_B)}>{(match?.teamB && teams.get(match.teamB)) || t('tournament.admin.teamB')}</Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Button variant="contained" color="error" sx={{m: 1}}
                                                onClick={() => roundDraftFirstPicker(DraftTeam.NONE)}>{t('tournament.admin.none')}</Button>
                                    </Grid>

                                    <Grid item xs={12} sx={{mt: 1}}>
                                        <Divider/>
                                    </Grid>

                                    {/* Draft actions */}
                                    <Grid item xs={6} sx={{mt: 1}}>
                                        <Button variant="contained" sx={{m: 1}} color="error"
                                                onClick={() => roundRerollMap()}>{t('tournament.admin.rerollMap')}</Button>
                                    </Grid>
                                    <Grid item xs={6} sx={{mt: 1}}>
                                        <Button variant="contained" sx={{m: 1}} color="error"
                                                onClick={() => roundResetDraft()}>{t('tournament.admin.resetDraft')}</Button>
                                    </Grid>
                                </Grid>

                                {/* ── Sub-section: Round result ── */}
                                <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 500, color: '#8299a1'}}>{t('tournament.admin.sectionRoundResult')}</Typography>
                                <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329', alignItems: 'center'}}>
                                    {/* Round winner */}
                                    <Grid item xs={3}>
                                        <Typography sx={{ml: 1, mt: 1}}
                                                    display="inline">{t('tournament.admin.roundWinner')}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Button variant="outlined" sx={{m: 1}}
                                                onClick={() => setRoundWinner(DraftTeam.TEAM_A)}>{(match?.teamA && teams.get(match.teamA)) || t('tournament.admin.teamA')}</Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Button variant="outlined" sx={{m: 1}}
                                                onClick={() => setRoundWinner(DraftTeam.TEAM_B)}>{(match?.teamB && teams.get(match.teamB)) || t('tournament.admin.teamB')}</Button>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField size="small" sx={{m: 1}} label={t('tournament.admin.roundTurnNumber')}
                                                   id="catchPhrase" value={fight?.history?.turns} type="number"
                                                   onChange={(newValue) => setRoundTurns(+newValue.target.value)}/>
                                    </Grid>

                                    {/* Present players */}
                                    <Grid item xs={12} sx={{mt: 1}}>
                                        <Divider/>
                                    </Grid>
                                    <Grid item xs={12} sx={{p: 1}}>
                                        <Typography display="inline">{t('tournament.admin.playersFromTeamA')}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{p: 1}}>
                                        {teamAPlayers && [...teamAPlayers.keys()].map((playerId) => (
                                            <FormControlLabel key={`teamA_${playerId}`} label={teamAPlayers.get(playerId)}
                                                              control={<Checkbox checked={presentPlayers.has(playerId)}
                                                                                 onChange={(e) => changePresentPlayers(playerId, e.target.checked)}/>}/>
                                        ))}
                                    </Grid>
                                    <Grid item xs={12} sx={{p: 1}}>
                                        <Typography display="inline">{t('tournament.admin.playersFromTeamB')}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{p: 1}}>
                                        {teamBPlayers && [...teamBPlayers.keys()].map((playerId) => (
                                            <FormControlLabel key={`teamB_${playerId}`} label={teamBPlayers.get(playerId)}
                                                              control={<Checkbox checked={presentPlayers.has(playerId)}
                                                                                 onChange={(e) => changePresentPlayers(playerId, e.target.checked)}/>}/>
                                        ))}
                                    </Grid>

                                    {/* Send stats */}
                                    <Grid item xs={12} sx={{mt: 1}}>
                                        <Divider/>
                                    </Grid>
                                    <Grid item xs={12} sx={{mt: 1}}>
                                        <Button variant="contained" sx={{m: 1}} color="error"
                                                onClick={() => roundSendStats()}>{t('tournament.admin.sendFightStats')}</Button>
                                    </Grid>
                                </Grid>

                                {/* ── Sub-section: Kill history ── */}
                                {fight && fight.teamADraft && fight.teamBDraft && (
                                    <>
                                        <Typography variant="subtitle1" sx={{mb: 1, fontWeight: 500, color: '#8299a1'}}>{t('tournament.admin.sectionKillHistory')}</Typography>
                                        <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329'}}>
                                            <Grid item xs={5}>
                                                <Typography display="inline"
                                                            sx={{mr: 1}}>{t('tournament.admin.team')}</Typography>
                                                <Select variant="outlined" size="small" value={currentHistoryEntry.team}
                                                        onChange={(event: SelectChangeEvent) => {
                                                            setCurrentHistoryEntry({
                                                                ...currentHistoryEntry,
                                                                team: event.target.value
                                                            })
                                                        }}>
                                                    <MenuItem
                                                        value={match?.teamA}>{teams.get(match?.teamA || "")}</MenuItem>
                                                    <MenuItem
                                                        value={match?.teamB}>{teams.get(match?.teamB || "")}</MenuItem>
                                                </Select>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography display="inline"
                                                            sx={{mr: 1}}>{t('tournament.admin.killer')}</Typography>
                                                <Select variant="outlined" size="small"
                                                        value={currentHistoryEntry.source as unknown as string}
                                                        onChange={(event: SelectChangeEvent) => {
                                                            setCurrentHistoryEntry({
                                                                ...currentHistoryEntry,
                                                                source: (event.target.value as unknown as number)
                                                            })
                                                        }}>
                                                    {BreedsArray.map(breed => (
                                                        <MenuItem key={`source_${breed}`} value={breed}>
                                                            <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                                                                 width={40}/>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography display="inline"
                                                            sx={{mr: 1}}>{t('tournament.admin.killed')}</Typography>
                                                <Select variant="outlined" size="small"
                                                        value={currentHistoryEntry.target as unknown as string}
                                                        onChange={(event: SelectChangeEvent) => {
                                                            setCurrentHistoryEntry({
                                                                ...currentHistoryEntry,
                                                                target: (event.target.value as unknown as number)
                                                            })
                                                        }}>
                                                    {BreedsArray.map(breed => (
                                                        <MenuItem key={`target_${breed}`} value={breed}>
                                                            <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                                                                 width={40}/>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Button variant="contained"
                                                        onClick={() => addCurrentHistoryEntryToHistory()}>{t('tournament.admin.add')}</Button>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {fight && fight.history && fight.history.entries?.map((entry, index) => (
                                                    <Typography key={`history_${index}`}>
                                                        {teams.get(entry.team || "")} {Breeds[entry.source as number]} killed {Breeds[entry.target as number]}
                                                    </Typography>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </div>

                            {/* ── Section: Auto-refereeing reports ── */}
                            {isAutoRefereeing && matchReports.length > 0 && (
                                <div hidden={!isRefereeOrAdmin}>
                                    <Typography variant="h6" sx={{mb: 1}}>{t('tournament.admin.sectionReports')}</Typography>
                                    <Grid container sx={{borderRadius: 3, mb: 2, p: 1, backgroundColor: '#162329'}}>
                                        <Grid item xs={12} sx={{mb: 1}}>
                                            <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                {t('tournament.admin.viewReports')}
                                                {matchReports.some(r => r.disputed) &&
                                                    <WarningAmberIcon sx={{color: '#e64b4b'}}/>
                                                }
                                            </Typography>
                                        </Grid>
                                        {matchReports.map((report) => (
                                            <Grid item xs={12} key={`report_${report.round}`} sx={{mb: 1, p: 1, backgroundColor: '#0f1c22', borderRadius: 2}}>
                                                <Typography variant="subtitle2">
                                                    {t('tournament.match.matchNb', {nb: report.round + 1})}
                                                    {report.disputed && <WarningAmberIcon sx={{ml: 1, color: '#e64b4b', verticalAlign: 'middle', fontSize: '1rem'}}/>}
                                                </Typography>
                                                {report.teamAReportedWinner && (
                                                    <Typography variant="body2" color="#8299a1">
                                                        {t('tournament.admin.teamAReport')}: {teams.get(report.teamAReportedWinner) || report.teamAReportedWinner}
                                                    </Typography>
                                                )}
                                                {report.teamBReportedWinner && (
                                                    <Typography variant="body2" color="#8299a1">
                                                        {t('tournament.admin.teamBReport')}: {teams.get(report.teamBReportedWinner) || report.teamBReportedWinner}
                                                    </Typography>
                                                )}
                                                {report.teamADisputeExplanation && (
                                                    <Typography variant="body2" color="#e6a74b" sx={{mt: 0.5}}>
                                                        {t('tournament.admin.teamA')} — {t('tournament.admin.disputeExplanation')}: {report.teamADisputeExplanation}
                                                    </Typography>
                                                )}
                                                {report.teamBDisputeExplanation && (
                                                    <Typography variant="body2" color="#e6a74b" sx={{mt: 0.5}}>
                                                        {t('tournament.admin.teamB')} — {t('tournament.admin.disputeExplanation')}: {report.teamBDisputeExplanation}
                                                    </Typography>
                                                )}
                                                {report.teamAScreenshot && (
                                                    <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5}}>
                                                        <Typography variant="caption">{t('tournament.admin.teamA')} — {t('tournament.admin.reportScreenshot')}</Typography>
                                                        <Tooltip
                                                            title={<img src={report.teamAScreenshot} alt="Team A screenshot" style={{maxWidth: 600, maxHeight: 450, borderRadius: 4}}/>}
                                                            placement="top"
                                                            arrow
                                                        >
                                                            <VisibilityIcon sx={{color: '#8299a1', cursor: 'pointer', fontSize: '1.1rem'}}/>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                                {report.teamBScreenshot && (
                                                    <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, ml: 2}}>
                                                        <Typography variant="caption">{t('tournament.admin.teamB')} — {t('tournament.admin.reportScreenshot')}</Typography>
                                                        <Tooltip
                                                            title={<img src={report.teamBScreenshot} alt="Team B screenshot" style={{maxWidth: 854, maxHeight: 480, borderRadius: 4}}/>}
                                                            placement="top"
                                                            arrow
                                                        >
                                                            <VisibilityIcon sx={{color: '#8299a1', cursor: 'pointer', fontSize: '1.1rem'}}/>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Grid>
                                        ))}
                                    </Grid>
                                </div>
                            )}

                            {/* ── Section: Match result ── */}
                            <div hidden={!isRefereeOrAdmin}>
                                <Typography variant="h6" sx={{mb: 1}}>{t('tournament.admin.sectionMatchResult')}</Typography>
                                <Grid container sx={{borderRadius: 3, p: 1, backgroundColor: '#162329', alignItems: 'center'}}>
                                    <Grid item xs={3.5}>
                                        <Button variant="outlined"
                                                onClick={() => setMatchWinner(DraftTeam.TEAM_A)}>{t('tournament.admin.matchWinnerTeamA')}</Button>
                                    </Grid>
                                    <Grid item xs={3.5}>
                                        <Button variant="outlined"
                                                onClick={() => setMatchWinner(DraftTeam.TEAM_B)}>{t('tournament.admin.matchWinnerTeamB')}</Button>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Button variant="contained" color="error"
                                                onClick={() => validateMatchAndSendStats()}>{t('tournament.admin.validateMatchAndSendStats')}</Button>
                                    </Grid>
                                </Grid>
                            </div>

                        </CardContent>
                    </Card>
                </TournamentAdminDialog>
            </div>
        </Grid>
    )
}
