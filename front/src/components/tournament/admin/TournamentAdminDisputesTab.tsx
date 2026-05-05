import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAtomState} from "@zedux/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {MatchReportModel, TournamentDefinition} from "../../../chore/tournament.ts";
import {getDisputes, resolveDispute, teamSearch} from "../../../services/tournament.ts";
import {teamCacheState} from "../../../atoms/atoms-tournament.ts";
import {snackState} from "../../../atoms/atoms-snackbar.ts";

type TournamentAdminDisputesTabProps = {
    tournament: TournamentDefinition;
    active: boolean;
}

export default function TournamentAdminDisputesTab({active}: TournamentAdminDisputesTabProps) {
    const {t} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const [teams, setTeamsCache] = useAtomState(teamCacheState);
    const [, setSnackValue] = useAtomState(snackState);
    const [disputes, setDisputes] = useState<MatchReportModel[]>([]);

    useEffect(() => {
        if (!id || !active) return;
        loadDisputes();
    }, [id, active]);

    function loadDisputes() {
        getDisputes(id || "").then(response => {
            if (!response?.disputes) return;
            setDisputes(response.disputes);

            const teamIds = new Set<string>();
            for (const d of response.disputes) {
                if (d.teamAReportedWinner) teamIds.add(d.teamAReportedWinner);
                if (d.teamBReportedWinner) teamIds.add(d.teamBReportedWinner);
            }
            const toLoad = Array.from(teamIds).filter(tid => !teams.get(tid));
            if (toLoad.length > 0) {
                teamSearch(id || "", toLoad).then(res => {
                    const ltc = new Map(teams);
                    for (const team of res.teams) {
                        ltc.set(team.id, team.name);
                    }
                    setTeamsCache(ltc);
                });
            }
        });
    }

    function handleResolve(dispute: MatchReportModel, winner: string) {
        resolveDispute(id || "", dispute.matchId, dispute.round, winner).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: t(response.success ? "success" : "failure") as string,
                open: true,
            });
            if (response.success) loadDisputes();
        });
    }

    function getTeamName(teamId?: string) {
        if (!teamId) return "?";
        return teams.get(teamId) || teamId.substring(0, 8);
    }

    return (
        <Box>
            <Typography variant="h5" sx={{mb: 2}}>
                <WarningAmberIcon sx={{verticalAlign: "middle", mr: 1, color: "#e64b4b"}}/>
                {t('tournament.admin.disputes.title')}
            </Typography>

            {disputes.length === 0 && (
                <Card sx={{backgroundColor: '#213943', mb: 2}}>
                    <CardContent>
                        <Typography sx={{display: 'flex', alignItems: 'center', color: '#07c6b6'}}>
                            <CheckCircleIcon sx={{mr: 1}}/>
                            {t('tournament.admin.disputes.none')}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {disputes.map((dispute) => (
                <Card key={`${dispute.matchId}-${dispute.round}`} sx={{backgroundColor: '#213943', mb: 2}}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Typography variant="h6">
                                    {t('tournament.admin.disputes.matchRound', {
                                        matchId: dispute.matchId,
                                        round: dispute.round + 1
                                    })}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="text"
                                    sx={{color: '#07c6b6', textTransform: 'none'}}
                                    onClick={() => navigate(`/tournament/${id}/tab/4/match/${dispute.matchId}`)}
                                >
                                    {t('tournament.admin.disputes.viewMatch')}
                                </Button>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{color: '#8299a1'}}>
                                    {t('tournament.admin.teamAReport')}:
                                </Typography>
                                <Typography>
                                    <Link to={`/tournament/${id}/tab/2/team/${dispute.teamAReportedWinner}`} style={{color: 'inherit', textDecoration: 'none'}}>
                                        {getTeamName(dispute.teamAReportedWinner)}
                                    </Link>
                                </Typography>
                                {dispute.teamADisputeExplanation && (
                                    <Typography variant="body2" sx={{mt: 1, fontStyle: 'italic', color: '#8299a1'}}>
                                        "{dispute.teamADisputeExplanation}"
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body2" sx={{color: '#8299a1'}}>
                                    {t('tournament.admin.teamBReport')}:
                                </Typography>
                                <Typography>
                                    <Link to={`/tournament/${id}/tab/2/team/${dispute.teamBReportedWinner}`} style={{color: 'inherit', textDecoration: 'none'}}>
                                        {getTeamName(dispute.teamBReportedWinner)}
                                    </Link>
                                </Typography>
                                {dispute.teamBDisputeExplanation && (
                                    <Typography variant="body2" sx={{mt: 1, fontStyle: 'italic', color: '#8299a1'}}>
                                        "{dispute.teamBDisputeExplanation}"
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{my: 1}}/>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{mb: 1, color: '#8299a1'}}>
                                    {t('tournament.admin.disputes.declareWinner')}:
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{mr: 2, backgroundColor: '#017d7f'}}
                                    onClick={() => handleResolve(dispute, dispute.teamAReportedWinner!)}
                                    disabled={!dispute.teamAReportedWinner}
                                >
                                    {getTeamName(dispute.teamAReportedWinner)}
                                </Button>
                                <Button
                                    variant="contained"
                                    sx={{backgroundColor: '#017d7f'}}
                                    onClick={() => handleResolve(dispute, dispute.teamBReportedWinner!)}
                                    disabled={!dispute.teamBReportedWinner}
                                >
                                    {getTeamName(dispute.teamBReportedWinner)}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}


