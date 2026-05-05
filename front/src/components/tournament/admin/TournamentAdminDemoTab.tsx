import {useState} from "react";
import {useParams} from "react-router-dom";
import {useAtomState} from "@zedux/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ScienceIcon from "@mui/icons-material/Science";
import CircularProgress from "@mui/material/CircularProgress";

import {TournamentDefinition} from "../../../chore/tournament.ts";
import {postDemoAction} from "../../../services/tournament.ts";
import {snackState} from "../../../atoms/atoms-snackbar.ts";

type TournamentAdminDemoTabProps = {
    tournament: TournamentDefinition;
    active: boolean;
}

export default function TournamentAdminDemoTab({tournament, active}: TournamentAdminDemoTabProps) {
    const {id} = useParams();
    const [, setSnackValue] = useAtomState(snackState);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    if (!active || !tournament.demo) return null;

    function handleAction(actionKey: string, label: string) {
        if (!id) return;
        if (!window.confirm(`Are you sure you want to execute "${label}"? This action may modify tournament data.`)) return;

        setLoadingAction(actionKey);
        postDemoAction(id, actionKey).then(response => {
            setSnackValue({
                severity: response.success ? "info" : "error",
                message: response.success ? `"${label}" executed successfully` : `"${label}" failed`,
                open: true,
            });
            setLoadingAction(null);
        }).catch(() => {
            setSnackValue({
                severity: "error",
                message: `"${label}" failed unexpectedly`,
                open: true,
            });
            setLoadingAction(null);
        });
    }

    const demoEntries = Object.entries(tournament.demo);

    return (
        <Box>
            <Typography variant="h5" sx={{mb: 2}}>
                <ScienceIcon sx={{verticalAlign: "middle", mr: 1, color: "#ff9800"}}/>
                Demo Actions
            </Typography>

            <Card sx={{backgroundColor: '#213943', mb: 2, border: '1px solid #4a3a1a'}}>
                <CardContent>
                    <Typography variant="body2" sx={{color: '#ffa726', mb: 2}}>
                        ⚠️ These actions directly modify tournament data. Use with caution.
                    </Typography>

                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                        {demoEntries.map(([actionKey, label]) => (
                            <Button
                                key={actionKey}
                                variant="contained"
                                disabled={loadingAction !== null}
                                sx={{
                                    backgroundColor: '#ff9800',
                                    '&:hover': {backgroundColor: '#f57c00'},
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                }}
                                onClick={() => handleAction(actionKey, label)}
                                startIcon={loadingAction === actionKey ? <CircularProgress size={16} color="inherit"/> : undefined}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

