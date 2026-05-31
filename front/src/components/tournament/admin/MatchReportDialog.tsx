import {useState} from "react";
import {useTranslation} from "react-i18next";
import {useAtomState} from "@zedux/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArticleIcon from "@mui/icons-material/Article";

import {MatchReportModel} from "../../../chore/tournament.ts";
import {getMatchReports} from "../../../services/tournament.ts";
import {teamCacheState} from "../../../atoms/atoms-tournament.ts";

type MatchReportDialogProps = {
    tournamentId: string;
    matchId: string;
}

export default function MatchReportDialog({tournamentId, matchId}: MatchReportDialogProps) {
    const {t} = useTranslation();
    const [teams] = useAtomState(teamCacheState);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<MatchReportModel[]>([]);
    const [loaded, setLoaded] = useState(false);

    function handleOpen() {
        setOpen(true);
        if (!loaded) {
            setLoading(true);
            getMatchReports(tournamentId, matchId).then(response => {
                setReports(response?.reports || []);
                setLoading(false);
                setLoaded(true);
            });
        }
    }

    function handleClose() {
        setOpen(false);
    }

    return (
        <>
            <Button
                size="small"
                variant="text"
                sx={{color: '#e6a74b', textTransform: 'none', mr: 1}}
                onClick={handleOpen}
                startIcon={<ArticleIcon sx={{fontSize: '1rem'}}/>}
            >
                {t('tournament.admin.tournamentControl.viewReport')}
            </Button>
            <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth scroll="paper"
                    slotProps={{paper: {sx: {maxHeight: '85vh', backgroundColor: '#1a2e36'}}}}>
                <DialogTitle sx={{color: '#fefffa', display: 'flex', alignItems: 'center', gap: 1}}>
                    {t('tournament.admin.tournamentControl.viewReport')}
                    {reports.some(r => r.disputed) && <WarningAmberIcon sx={{color: '#e64b4b'}}/>}
                </DialogTitle>
                <DialogContent dividers sx={{p: 2, borderColor: '#2a4a54'}}>
                    {loading && (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                            <CircularProgress sx={{color: '#07c6b6'}}/>
                        </Box>
                    )}
                    {!loading && loaded && reports.length === 0 && (
                        <Typography sx={{color: '#8299a1', textAlign: 'center', py: 2}}>
                            {t('tournament.admin.tournamentControl.noReports')}
                        </Typography>
                    )}
                    {!loading && reports.length > 0 && (
                        <Grid container spacing={1}>
                            {reports.map((report) => (
                                <Grid item xs={12} key={`report_${report.round}`}
                                      sx={{mb: 1, p: 1.5, backgroundColor: '#0f1c22', borderRadius: 2}}>
                                    <Typography variant="subtitle2" sx={{color: '#fefffa', mb: 0.5}}>
                                        {t('tournament.match.matchNb', {nb: report.round + 1})}
                                        {report.disputed &&
                                            <WarningAmberIcon sx={{ml: 1, color: '#e64b4b', verticalAlign: 'middle', fontSize: '1rem'}}/>
                                        }
                                    </Typography>
                                    {report.teamAReportedWinner && (
                                        <Typography variant="body2" sx={{color: '#8299a1'}}>
                                            {t('tournament.admin.teamAReport')}: {teams.get(report.teamAReportedWinner) || report.teamAReportedWinner}
                                        </Typography>
                                    )}
                                    {report.teamBReportedWinner && (
                                        <Typography variant="body2" sx={{color: '#8299a1'}}>
                                            {t('tournament.admin.teamBReport')}: {teams.get(report.teamBReportedWinner) || report.teamBReportedWinner}
                                        </Typography>
                                    )}
                                    {report.teamADisputeExplanation && (
                                        <Typography variant="body2" sx={{color: '#e6a74b', mt: 0.5}}>
                                            {t('tournament.admin.teamA')} — {t('tournament.admin.disputeExplanation')}: {report.teamADisputeExplanation}
                                        </Typography>
                                    )}
                                    {report.teamBDisputeExplanation && (
                                        <Typography variant="body2" sx={{color: '#e6a74b', mt: 0.5}}>
                                            {t('tournament.admin.teamB')} — {t('tournament.admin.disputeExplanation')}: {report.teamBDisputeExplanation}
                                        </Typography>
                                    )}
                                    {report.teamAScreenshot && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="caption" sx={{color: '#8299a1'}}>
                                                {t('tournament.admin.teamA')} — {t('tournament.admin.reportScreenshot')}
                                            </Typography>
                                            <Box sx={{mt: 0.5}}>
                                                <img src={report.teamAScreenshot} alt="Team A screenshot"
                                                     style={{maxWidth: '100%', maxHeight: 300, borderRadius: 4}}/>
                                            </Box>
                                        </Box>
                                    )}
                                    {report.teamBScreenshot && (
                                        <Box sx={{mt: 1}}>
                                            <Typography variant="caption" sx={{color: '#8299a1'}}>
                                                {t('tournament.admin.teamB')} — {t('tournament.admin.reportScreenshot')}
                                            </Typography>
                                            <Box sx={{mt: 0.5}}>
                                                <img src={report.teamBScreenshot} alt="Team B screenshot"
                                                     style={{maxWidth: '100%', maxHeight: 300, borderRadius: 4}}/>
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

