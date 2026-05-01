import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAtomState} from "@zedux/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";

import {
    TournamentDefinition,
    TournamentMatchModel,
    TournamentPhaseType,
    TournamentStandingsResponse
} from "../../../chore/tournament.ts";
import {
    adminSetMatchWinner,
    getStandings,
    postGoToNextPhase,
    postMatchesSearch,
    postRecomputeStats,
    recomputeDiscordRoles,
    teamSearch
} from "../../../services/tournament.ts";
import {teamCacheState} from "../../../atoms/atoms-tournament.ts";
import {snackState} from "../../../atoms/atoms-snackbar.ts";

const PHASE_TYPE_LABELS: Record<number, string> = {
    [TournamentPhaseType.WAKFU_WARRIORS_ROUND_ROBIN]: "Round Robin",
    [TournamentPhaseType.WAKFU_WARRIORS_BRACKET_TOURNAMENT]: "Bracket",
    [TournamentPhaseType.WAKFU_WARRIORS_DOUBLE_ELIMINATION_TOURNAMENT]: "Double Elimination",
    [TournamentPhaseType.WAKFU_CHAMPIONS_QUALIFICATION]: "Qualification",
    [TournamentPhaseType.WAKFU_CHAMPIONS_BRACKET]: "Bracket",
};

type TournamentAdminControlTabProps = {
    tournament: TournamentDefinition;
    active: boolean;
}

export default function TournamentAdminControlTab({tournament, active}: TournamentAdminControlTabProps) {
    const {t} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const [teams, setTeamsCache] = useAtomState(teamCacheState);
    const [, setSnackValue] = useAtomState(snackState);
    const [locked, setLocked] = useState(false);

    const [standings, setStandings] = useState<TournamentStandingsResponse | null>(null);
    const [currentPhaseMatches, setCurrentPhaseMatches] = useState<TournamentMatchModel[]>([]);
    const [loadingOverview, setLoadingOverview] = useState(false);

    useEffect(() => {
        if (!id || !active) return;
        loadPhaseOverview();
    }, [id, active]);

    function loadPhaseOverview() {
        if (!id) return;
        setLoadingOverview(true);

        getStandings(id).then(standingsResponse => {
            setStandings(standingsResponse);

            if (standingsResponse?.phases?.length > 0) {
                const currentPhaseIndex = standingsResponse.phases.length;

                postMatchesSearch(id, {type: "PLANNING", phase: currentPhaseIndex}).then(planningRes => {
                    postMatchesSearch(id, {type: "RESULTS", phase: currentPhaseIndex}).then(resultsRes => {
                        const allMatches = [
                            ...(planningRes?.matches || []),
                            ...(resultsRes?.matches || [])
                        ];

                        setCurrentPhaseMatches(allMatches);

                        const teamIds = new Set<string>();
                        for (const m of allMatches) {
                            if (m.teamA) teamIds.add(m.teamA);
                            if (m.teamB) teamIds.add(m.teamB);
                        }
                        const toLoad = Array.from(teamIds).filter(tid => !teams.get(tid));
                        if (toLoad.length > 0) {
                            teamSearch(id, toLoad).then(res => {
                                const ltc = new Map(teams);
                                for (const team of res.teams) {
                                    ltc.set(team.id, team.name);
                                }
                                setTeamsCache(ltc);
                            });
                        }
                        setLoadingOverview(false);
                    });
                });
            } else {
                setLoadingOverview(false);
            }
        });
    }

    function getTeamName(teamId?: string) {
        if (!teamId) return "?";
        return teams.get(teamId) || teamId.substring(0, 8);
    }

    function handleGoToNextPhase() {
        if (!id) return;
        if (!window.confirm(t('tournament.admin.tournamentControl.confirmNextPhase') as string)) return;
        setLocked(true);
        postGoToNextPhase(id).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: t(response.success ? "success" : "failure") as string,
                open: true,
            });
            setLocked(false);
            if (response.success) {
                loadPhaseOverview();
            }
        });
    }

    function handleRecomputeStats() {
        if (!id) return;
        if (!window.confirm(t('tournament.admin.tournamentControl.confirmRecomputeStats') as string)) return;
        setLocked(true);
        postRecomputeStats(id).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: t(response.success ? "success" : "failure") as string,
                open: true,
            });
            setLocked(false);
        });
    }

    function handleRecomputeDiscordRoles() {
        if (!id) return;
        if (!window.confirm(t('tournament.admin.discordRoles.confirmRecompute') as string)) return;
        recomputeDiscordRoles(id).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: t(response.success ? "tournament.admin.discordRoles.started" : "failure") as string,
                open: true,
            });
        });
    }

    function handleAdminSetWinner(matchId: string, winner: string) {
        if (!id) return;
        const teamName = getTeamName(winner);
        if (!window.confirm(t('tournament.admin.tournamentControl.confirmSetWinner', {team: teamName}) as string)) return;
        setLocked(true);
        adminSetMatchWinner(id, matchId, winner).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: t(response.success ? "success" : "failure") as string,
                open: true,
            });
            setLocked(false);
            if (response.success) {
                loadPhaseOverview();
            }
        });
    }

    const currentPhaseIndex = standings?.phases?.length || 0;
    const currentPhaseData = standings?.phases?.[currentPhaseIndex - 1];
    const currentRound = currentPhaseData?.currentRound || 0;
    const currentPhaseDef = tournament.phases?.[currentPhaseIndex - 1];
    const totalRounds = currentPhaseDef?.roundModel?.length || 0;
    const totalPhases = tournament.phases?.length || 0;

    const hasNextRound = currentRound > 0 && currentRound < totalRounds;
    const hasNextPhase = currentPhaseIndex < totalPhases;
    const nextPhaseDef = hasNextPhase ? tournament.phases[currentPhaseIndex] : null;

    const currentRoundMatches = currentPhaseMatches.filter(m => m.round === currentRound);
    const pendingMatches = currentRoundMatches.filter(m => !m.done);
    const doneMatches = currentRoundMatches.filter(m => m.done);

    const nextActionLabel = hasNextRound
        ? t('tournament.admin.tournamentControl.nextRound', {round: currentRound + 1})
        : hasNextPhase
            ? t('tournament.admin.tournamentControl.nextPhase', {phase: currentPhaseIndex + 1, type: PHASE_TYPE_LABELS[nextPhaseDef?.phaseType ?? 0] || "?"})
            : t('tournament.admin.tournamentControl.noNextStep');

    const canAdvance = (hasNextRound || hasNextPhase) && pendingMatches.length === 0;

    return (
        <Box>
            {/* Tournament Control Section */}
            <Typography variant="h5" sx={{mb: 2}}>
                <SettingsIcon sx={{verticalAlign: "middle", mr: 1, color: "#07c6b6"}}/>
                {t('tournament.admin.tournamentControl.title')}
            </Typography>

            {/* Phase & Round Info Banner */}
            {currentPhaseIndex > 0 && (
                <Card sx={{backgroundColor: '#1a2e36', mb: 2, border: '1px solid #2a4a56'}}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" sx={{color: '#8299a1', mb: 0.5}}>
                                    {t('tournament.admin.tournamentControl.currentPhase')}
                                </Typography>
                                <Typography variant="h6">
                                    {t('tournament.admin.tournamentControl.phaseLabel', {
                                        phase: currentPhaseIndex,
                                        total: totalPhases,
                                        type: PHASE_TYPE_LABELS[currentPhaseDef?.phaseType ?? 0] || "?"
                                    })}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" sx={{color: '#8299a1', mb: 0.5}}>
                                    {t('tournament.admin.tournamentControl.currentRound')}
                                </Typography>
                                <Typography variant="h6">
                                    {currentRound > 0
                                        ? t('tournament.admin.tournamentControl.roundLabel', {round: currentRound, total: totalRounds})
                                        : t('tournament.admin.tournamentControl.notStarted')
                                    }
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" sx={{color: '#8299a1', mb: 0.5}}>
                                    {t('tournament.admin.tournamentControl.matchStatus')}
                                </Typography>
                                <Box sx={{display: 'flex', gap: 1}}>
                                    <Chip
                                        icon={<CheckCircleIcon/>}
                                        label={`${doneMatches.length} ${t('tournament.admin.tournamentControl.done')}`}
                                        size="small"
                                        sx={{backgroundColor: '#0a3a2a', color: '#07c6b6'}}
                                    />
                                    <Chip
                                        icon={<HourglassEmptyIcon/>}
                                        label={`${pendingMatches.length} ${t('tournament.admin.tournamentControl.pending')}`}
                                        size="small"
                                        sx={{backgroundColor: pendingMatches.length > 0 ? '#3a2a0a' : '#1a2e36', color: pendingMatches.length > 0 ? '#ffa726' : '#8299a1'}}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Current Round Matches */}
            {currentRound > 0 && currentRoundMatches.length > 0 && (
                <Card sx={{backgroundColor: '#213943', mb: 2}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2}}>
                            {t('tournament.admin.tournamentControl.roundMatches', {round: currentRound})}
                        </Typography>

                        {currentRoundMatches.map((match) => (
                            <Card key={match.id} sx={{
                                backgroundColor: match.done ? '#1a2e36' : '#2a1a0a',
                                mb: 1,
                                border: `1px solid ${match.done ? '#2a4a56' : '#4a3a1a'}`
                            }}>
                                <CardContent sx={{py: 1.5, "&:last-child": {pb: 1.5}}}>
                                    <Grid container alignItems="center" spacing={1}>
                                        <Grid item xs={1}>
                                            {match.done
                                                ? <CheckCircleIcon sx={{color: '#07c6b6'}}/>
                                                : <HourglassEmptyIcon sx={{color: '#ffa726'}}/>
                                            }
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: match.winner === match.teamA ? 'bold' : 'normal',
                                                        color: match.winner === match.teamA ? '#07c6b6' : 'inherit'
                                                    }}
                                                >
                                                    <Link to={`/tournament/${id}/tab/2/team/${match.teamA}`} style={{color: 'inherit', textDecoration: 'none'}}>
                                                        {getTeamName(match.teamA)}
                                                    </Link>
                                                </Typography>
                                                {match.winner === match.teamA && <EmojiEventsIcon sx={{color: '#07c6b6', fontSize: 18}}/>}
                                                <Typography sx={{color: '#8299a1', mx: 0.5}}>vs</Typography>
                                                <Typography
                                                    sx={{
                                                        fontWeight: match.winner === match.teamB ? 'bold' : 'normal',
                                                        color: match.winner === match.teamB ? '#07c6b6' : 'inherit'
                                                    }}
                                                >
                                                    <Link to={`/tournament/${id}/tab/2/team/${match.teamB}`} style={{color: 'inherit', textDecoration: 'none'}}>
                                                        {getTeamName(match.teamB)}
                                                    </Link>
                                                </Typography>
                                                {match.winner === match.teamB && <EmojiEventsIcon sx={{color: '#07c6b6', fontSize: 18}}/>}
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sx={{textAlign: 'right'}}>
                                            <Button
                                                size="small"
                                                variant="text"
                                                sx={{color: '#07c6b6', textTransform: 'none', mr: 1}}
                                                onClick={() => navigate(`/tournament/${id}/tab/4/match/${match.id}`)}
                                            >
                                                {t('tournament.admin.tournamentControl.viewMatch')}
                                            </Button>
                                            {!match.done && (
                                                <>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        disabled={locked}
                                                        sx={{backgroundColor: '#017d7f', mr: 0.5, fontSize: '0.7rem'}}
                                                        onClick={() => handleAdminSetWinner(match.id!, match.teamA)}
                                                    >
                                                        {getTeamName(match.teamA)}
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        disabled={locked}
                                                        sx={{backgroundColor: '#017d7f', fontSize: '0.7rem'}}
                                                        onClick={() => handleAdminSetWinner(match.id!, match.teamB)}
                                                    >
                                                        {getTeamName(match.teamB)}
                                                    </Button>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            {loadingOverview && (
                <Card sx={{backgroundColor: '#213943', mb: 2}}>
                    <CardContent>
                        <Typography sx={{color: '#8299a1'}}>
                            {t('tournament.admin.tournamentControl.loading')}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Next Step Info + Actions */}
            <Card sx={{backgroundColor: '#213943', mb: 3}}>
                <CardContent>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <ArrowForwardIcon sx={{color: canAdvance ? '#07c6b6' : '#8299a1', mr: 1}}/>
                        <Typography variant="body1" sx={{
                            color: canAdvance ? '#07c6b6' : '#8299a1',
                            fontWeight: canAdvance ? 'bold' : 'normal'
                        }}>
                            {nextActionLabel}
                        </Typography>
                    </Box>

                    {pendingMatches.length > 0 && (hasNextRound || hasNextPhase) && (
                        <Typography variant="body2" sx={{color: '#ffa726', mb: 2}}>
                            <WarningAmberIcon sx={{fontSize: 16, verticalAlign: 'middle', mr: 0.5}}/>
                            {t('tournament.admin.tournamentControl.pendingWarning', {count: pendingMatches.length})}
                        </Typography>
                    )}

                    {hasNextPhase && !hasNextRound && nextPhaseDef && (
                        <Card sx={{backgroundColor: '#1a2e36', mb: 2, border: '1px solid #2a4a56'}}>
                            <CardContent sx={{py: 1.5, "&:last-child": {pb: 1.5}}}>
                                <Typography variant="body2" sx={{color: '#8299a1'}}>
                                    {t('tournament.admin.tournamentControl.nextPhasePreview')}
                                </Typography>
                                <Typography>
                                    {t('tournament.admin.tournamentControl.phasePreviewDetail', {
                                        type: PHASE_TYPE_LABELS[nextPhaseDef.phaseType] || "?",
                                        rounds: nextPhaseDef.roundModel?.length || 0
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}

                    {!hasNextRound && !hasNextPhase && currentPhaseIndex > 0 && (
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <BlockIcon sx={{color: '#8299a1', mr: 1}}/>
                            <Typography variant="body2" sx={{color: '#8299a1'}}>
                                {t('tournament.admin.tournamentControl.tournamentComplete')}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={locked || !canAdvance}
                            onClick={handleGoToNextPhase}
                        >
                            {t('tournament.admin.tournamentControl.goToNextPhase')}
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            disabled={locked}
                            onClick={handleRecomputeStats}
                        >
                            {t('tournament.admin.tournamentControl.recomputeStats')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Divider sx={{mb: 3}}/>

            {/* Discord Roles Section */}
            <Typography variant="h5" sx={{mb: 2}}>
                <GroupIcon sx={{verticalAlign: "middle", mr: 1, color: "#5865F2"}}/>
                {t('tournament.admin.discordRoles.title')}
            </Typography>
            <Card sx={{backgroundColor: '#213943', mb: 3}}>
                <CardContent>
                    <Typography variant="body2" sx={{color: '#8299a1', mb: 2}}>
                        {t('tournament.admin.discordRoles.description')}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{backgroundColor: '#5865F2', '&:hover': {backgroundColor: '#4752C4'}}}
                        onClick={handleRecomputeDiscordRoles}
                    >
                        {t('tournament.admin.discordRoles.recompute')}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}

