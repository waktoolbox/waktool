import {useEffect, useState} from "react";
import {useLoaderData, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {getPhases, getStandings, teamSearch} from "../../services/tournament.ts";
import {
    TournamentDefinition,
    TournamentPhaseData,
    TournamentPhaseDataTeam,
    TournamentPhaseType
} from "../../chore/tournament.ts";
import TournamentBracketTree from "./TournamentBracketTree.tsx";

interface TeamDisplayInfo {
    id: string;
    name: string;
    wins: number;
    losses: number;
    played: number;
}

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentBracketView() {
    const {t} = useTranslation();
    const {id} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const [loading, setLoading] = useState(true);
    const [standings, setStandings] = useState<TeamDisplayInfo[]>([]);
    const [selectedPhase, setSelectedPhase] = useState(0);

    // Determine which phases are bracket type (used for rendering isBracketPhase below)
    useEffect(() => {
        if (!id) return;
        getPhases(id).then(response => {
            const maxPhase = response?.maxPhase ?? 1;
            setSelectedPhase(Math.max(1, maxPhase));
        }).catch(() => {
            setSelectedPhase(tournament.phases.length > 0 ? 1 : 0);
        });
    }, [id]);

    useEffect(() => {
        if (!id || selectedPhase <= 0) return;

        const phaseConfig = tournament.phases[selectedPhase - 1];
        if (!phaseConfig) return;

        // Only load standings table for non-bracket phases
        if (phaseConfig.phaseType === TournamentPhaseType.WAKFU_CHAMPIONS_BRACKET) {
            setLoading(false);
            return;
        }

        async function loadStandings() {
            setLoading(true);
            try {
                const response = await getStandings(id!);
                if (!response?.phases || response.phases.length === 0) {
                    setStandings([]);
                    return;
                }

                const phaseData: TournamentPhaseData | undefined = response.phases[selectedPhase - 1];
                if (!phaseData?.teams || phaseData.teams.length === 0) {
                    setStandings([]);
                    return;
                }

                const teamIds = phaseData.teams.map((team: TournamentPhaseDataTeam) => team.id);
                const teamsResponse = await teamSearch(id!, teamIds);
                const teamsInfoMap = new Map<string, { name: string; played: number; victories: number }>();
                if (teamsResponse?.teams) {
                    for (const team of teamsResponse.teams) {
                        teamsInfoMap.set(team.id, {
                            name: team.name || team.id,
                            played: team.played ?? 0,
                            victories: team.victories ?? 0,
                        });
                    }
                }

                const teamStandings: TeamDisplayInfo[] = phaseData.teams.map((team: TournamentPhaseDataTeam) => {
                    const info = teamsInfoMap.get(team.id);
                    const victories = info?.victories ?? 0;
                    const played = info?.played ?? 0;
                    return {
                        id: team.id,
                        name: info?.name || team.id,
                        wins: victories,
                        losses: played - victories,
                        played: played,
                    };
                });

                teamStandings.sort((a, b) => b.wins - a.wins || a.losses - b.losses);
                setStandings(teamStandings);
            } catch (e) {
                console.error("Failed to load standings", e);
                setStandings([]);
            } finally {
                setLoading(false);
            }
        }

        loadStandings();
    }, [id, selectedPhase]);

    const currentPhaseConfig = selectedPhase > 0 ? tournament.phases[selectedPhase - 1] : undefined;
    const isBracketPhase = currentPhaseConfig?.phaseType === TournamentPhaseType.WAKFU_CHAMPIONS_BRACKET;

    return (
        <Box sx={{p: isBracketPhase ? 0 : 2}}>
            {/* Phase tabs if multiple phases */}
            {tournament.phases.length > 1 && (
                <Tabs
                    value={selectedPhase - 1}
                    onChange={(_, newVal) => setSelectedPhase(newVal + 1)}
                    sx={{mb: 3, px: 2}}
                >
                    {tournament.phases.map((p, index) => (
                        <Tab
                            key={index}
                            label={getPhaseLabel(p.phaseType, index + 1, t)}
                        />
                    ))}
                </Tabs>
            )}

            {/* Bracket tree for bracket phases */}
            {isBracketPhase && (
                <TournamentBracketTree phase={selectedPhase}/>
            )}

            {/* Standings table for qualification/other phases */}
            {!isBracketPhase && (
                <>
                    {loading && (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                            <CircularProgress/>
                        </Box>
                    )}

                    {!loading && standings.length === 0 && (
                        <Typography variant="h6" sx={{textAlign: 'center', color: '#8299a1', mt: 3}}>
                            {t('bracket.noStandings')}
                        </Typography>
                    )}

                    {!loading && standings.length > 0 && (
                        <>
                            <Typography variant="h5" sx={{mb: 2}}>
                                {t('bracket.standings')}
                            </Typography>

                            <TableContainer component={Paper} sx={{backgroundColor: '#162834'}}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{color: '#8299a1', fontWeight: 'bold'}}>#</TableCell>
                                            <TableCell sx={{color: '#8299a1', fontWeight: 'bold'}}>
                                                {t('bracket.team')}
                                            </TableCell>
                                            <TableCell align="center" sx={{color: '#8299a1', fontWeight: 'bold'}}>
                                                {t('bracket.wins')}
                                            </TableCell>
                                            <TableCell align="center" sx={{color: '#8299a1', fontWeight: 'bold'}}>
                                                {t('bracket.losses')}
                                            </TableCell>
                                            <TableCell align="center" sx={{color: '#8299a1', fontWeight: 'bold'}}>
                                                {t('bracket.played')}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {standings.map((team, index) => (
                                            <TableRow key={team.id} sx={{
                                                '&:nth-of-type(odd)': {backgroundColor: '#1a3040'},
                                                '&:nth-of-type(even)': {backgroundColor: '#162834'}
                                            }}>
                                                <TableCell sx={{color: '#e0e0e0'}}>{index + 1}</TableCell>
                                                <TableCell sx={{
                                                    color: '#e0e0e0',
                                                    fontWeight: 'bold'
                                                }}>{team.name}</TableCell>
                                                <TableCell align="center"
                                                           sx={{color: '#4caf50'}}>{team.wins}</TableCell>
                                                <TableCell align="center"
                                                           sx={{color: '#f44336'}}>{team.losses}</TableCell>
                                                <TableCell align="center"
                                                           sx={{color: '#e0e0e0'}}>{team.played}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </>
            )}
        </Box>
    );
}

function getPhaseLabel(phaseType: TournamentPhaseType, phaseNumber: number, t: (key: string) => string): string {
    switch (phaseType) {
        case TournamentPhaseType.WAKFU_CHAMPIONS_QUALIFICATION:
            return t('bracket.qualification');
        case TournamentPhaseType.WAKFU_CHAMPIONS_BRACKET:
            return t('bracket.bracket');
        default:
            return `Phase ${phaseNumber}`;
    }
}
