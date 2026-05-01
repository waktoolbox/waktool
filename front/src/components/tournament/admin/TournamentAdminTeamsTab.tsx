import {useEffect, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAtomState} from "@zedux/react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";

import {TournamentDefinition, TournamentTeamModel} from "../../../chore/tournament.ts";
import {deleteTeam, getTournamentTeam, getTournamentTeams} from "../../../services/tournament.ts";
import {snackState} from "../../../atoms/atoms-snackbar.ts";

type TournamentAdminTeamsTabProps = {
    tournament: TournamentDefinition;
    active: boolean;
}

interface TeamDetailCache {
    breeds?: number[];
    bannedBreeds?: number[];
    validatedPlayers?: string[];
}

export default function TournamentAdminTeamsTab({tournament, active}: TournamentAdminTeamsTabProps) {
    const {t} = useTranslation();
    const {id} = useParams();
    const [, setSnackValue] = useAtomState(snackState);
    const [teams, setTeams] = useState<TournamentTeamModel[]>([]);
    const [loading, setLoading] = useState(false);

    // Detail cache for hover (breeds/bans)
    const [detailCache, setDetailCache] = useState<Map<string, TeamDetailCache>>(new Map());
    const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

    // Popover state
    const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
    const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!id || !active) return;
        loadTeams();
    }, [id, active]);

    function loadTeams() {
        if (!id) return;
        setLoading(true);
        getTournamentTeams(id).then(response => {
            setTeams(response.teams || []);
            setLoading(false);
        });
    }

    function handleDelete(teamId: string, teamName: string) {
        if (!id) return;
        if (!window.confirm(t('tournament.admin.teams.confirmDelete', {name: teamName}) as string)) return;
        deleteTeam(id, teamId).then(() => {
            setSnackValue({severity: "info", message: t("success") as string, open: true});
            loadTeams();
        }).catch(() => {
            setSnackValue({severity: "error", message: t("failure") as string, open: true});
        });
    }

    function handleMouseEnter(event: React.MouseEvent<HTMLElement>, teamId: string) {
        const target = event.currentTarget;
        hoverTimerRef.current = setTimeout(() => {
            setPopoverAnchor(target);
            setHoveredTeamId(teamId);
            if (!detailCache.has(teamId)) {
                fetchTeamDetail(teamId);
            }
        }, 300);
    }

    function handleMouseLeave() {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setPopoverAnchor(null);
        setHoveredTeamId(null);
    }

    function fetchTeamDetail(teamId: string) {
        if (!id) return;
        setLoadingDetail(teamId);
        getTournamentTeam(id, teamId).then(response => {
            if (response?.team) {
                setDetailCache(prev => {
                    const next = new Map(prev);
                    next.set(teamId, {
                        breeds: response.team.breeds,
                        bannedBreeds: response.team.bannedBreeds,
                        validatedPlayers: response.team.validatedPlayers,
                    });
                    return next;
                });
            }
            setLoadingDetail(null);
        });
    }

    const maxTeams = tournament.teamNumber || 0;
    const popoverOpen = Boolean(popoverAnchor) && Boolean(hoveredTeamId);
    const hoveredDetail = hoveredTeamId ? detailCache.get(hoveredTeamId) : null;

    return (
        <Box>
            <Typography variant="h5" sx={{mb: 2}}>
                <GroupIcon sx={{verticalAlign: "middle", mr: 1, color: "#07c6b6"}}/>
                {t('tournament.admin.teams.title')}
                {teams.length > 0 && (
                    <Chip
                        label={`${teams.length}${maxTeams > 0 ? ` / ${maxTeams}` : ''}`}
                        size="small"
                        sx={{ml: 1, verticalAlign: "middle", backgroundColor: '#1a2e36', color: '#07c6b6'}}
                    />
                )}
            </Typography>

            {loading && (
                <Typography sx={{color: '#8299a1'}}>{t('tournament.admin.teams.loading')}</Typography>
            )}

            {!loading && teams.length === 0 && (
                <Typography sx={{color: '#8299a1'}}>{t('tournament.admin.teams.none')}</Typography>
            )}

            {!loading && teams.length > 0 && (
                <Box sx={{
                    border: '1px solid #2a4a56',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#1a2e36',
                        px: 2,
                        py: 1,
                        gap: 1,
                    }}>
                        <Typography sx={{width: 40, fontWeight: 'bold', color: '#8299a1', fontSize: '0.8rem'}}>#</Typography>
                        <Typography sx={{flex: 1, fontWeight: 'bold', color: '#8299a1', fontSize: '0.8rem'}}>
                            {t('tournament.admin.teams.name')}
                        </Typography>
                        <Typography sx={{width: 100, fontWeight: 'bold', color: '#8299a1', fontSize: '0.8rem', textAlign: 'center'}}>
                            {t('tournament.admin.teams.server')}
                        </Typography>
                        <Typography sx={{width: 60, fontWeight: 'bold', color: '#8299a1', fontSize: '0.8rem', textAlign: 'center'}}>
                            V/M
                        </Typography>
                        <Box sx={{width: 80}}/>
                    </Box>

                    {teams.map((team, index) => {
                        const position = index + 1;
                        const isOver = maxTeams > 0 && position > maxTeams;
                        const isFirstOver = maxTeams > 0 && position === maxTeams + 1;

                        return (
                            <Box key={team.id}>
                                {isFirstOver && (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#3a1a1a',
                                        py: 0.5,
                                    }}>
                                        <Typography sx={{
                                            color: '#e64b4b',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 1,
                                        }}>
                                            {t('tournament.admin.teams.overLimit')}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    onMouseEnter={(e) => handleMouseEnter(e, team.id!)}
                                    onMouseLeave={handleMouseLeave}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 2,
                                        py: 0.75,
                                        gap: 1,
                                        backgroundColor: isOver ? '#1a1a1a' : (index % 2 === 0 ? '#162329' : '#1a2e36'),
                                        opacity: isOver ? 0.7 : 1,
                                        '&:hover': {
                                            backgroundColor: '#213943',
                                        },
                                        cursor: 'default',
                                    }}
                                >
                                    <Typography sx={{
                                        width: 40,
                                        fontWeight: 'bold',
                                        color: isOver ? '#e64b4b' : '#07c6b6',
                                        fontSize: '0.85rem',
                                    }}>
                                        {position}
                                    </Typography>
                                    <Typography sx={{
                                        flex: 1,
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        <Link
                                            to={`/tournament/${id}/tab/2/team/${team.id}`}
                                            style={{color: 'inherit', textDecoration: 'none'}}
                                            onMouseEnter={(e) => e.stopPropagation()}
                                        >
                                            {team.name}
                                        </Link>
                                    </Typography>
                                    <Typography sx={{
                                        width: 100,
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        color: '#8299a1',
                                    }}>
                                        {team.server}
                                    </Typography>
                                    <Typography sx={{
                                        width: 60,
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        color: '#8299a1',
                                    }}>
                                        {team.victories || 0}/{team.played || 0}
                                    </Typography>
                                    <Box sx={{width: 80, textAlign: 'right'}}>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(team.id!, team.name)}
                                            sx={{minWidth: 'auto', p: 0.5}}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Popover for breeds/bans on hover */}
            <Popover
                open={popoverOpen}
                anchorEl={popoverAnchor}
                onClose={handleMouseLeave}
                anchorOrigin={{vertical: 'center', horizontal: 'right'}}
                transformOrigin={{vertical: 'center', horizontal: 'left'}}
                disableRestoreFocus
                sx={{pointerEvents: 'none'}}
                slotProps={{paper: {sx: {backgroundColor: '#1a2e36', border: '1px solid #2a4a56', p: 2, maxWidth: 350}}}}
            >
                {loadingDetail === hoveredTeamId && (
                    <Typography sx={{color: '#8299a1', fontSize: '0.85rem'}}>
                        {t('tournament.admin.teams.loadingDetail')}
                    </Typography>
                )}
                {hoveredDetail && (
                    <Box>
                        {/* Breeds / Composition */}
                        {hoveredDetail.breeds && hoveredDetail.breeds.length > 0 && (
                            <Box sx={{mb: 1}}>
                                <Typography sx={{color: '#07c6b6', fontWeight: 'bold', fontSize: '0.75rem', mb: 0.5}}>
                                    {t('tournament.team.composition')}
                                </Typography>
                                <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                    {hoveredDetail.breeds.map((breedId, i) => (
                                        <img
                                            key={i}
                                            src={`/classes/${breedId}_0.png`}
                                            alt={`breed-${breedId}`}
                                            style={{width: 28, height: 28}}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Banned breeds */}
                        {hoveredDetail.bannedBreeds && hoveredDetail.bannedBreeds.length > 0 && (
                            <Box sx={{mb: 1}}>
                                <Typography sx={{color: '#e64b4b', fontWeight: 'bold', fontSize: '0.75rem', mb: 0.5}}>
                                    {t('tournament.team.bannedBreeds')}
                                </Typography>
                                <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                                    {hoveredDetail.bannedBreeds.map((breedId, i) => (
                                        <Box key={i} sx={{position: 'relative', display: 'inline-block'}}>
                                            <img
                                                src={`/classes/${breedId}_0.png`}
                                                alt={`ban-${breedId}`}
                                                style={{width: 28, height: 28, opacity: 0.5}}
                                            />
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#e64b4b', fontSize: '1.2rem', fontWeight: 'bold',
                                            }}>
                                                ✕
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Players count */}
                        {hoveredDetail.validatedPlayers && (
                            <Box>
                                <Typography sx={{color: '#8299a1', fontSize: '0.75rem'}}>
                                    {t('tournament.admin.teams.players', {count: hoveredDetail.validatedPlayers.length})}
                                </Typography>
                            </Box>
                        )}

                        {/* No composition registered */}
                        {(!hoveredDetail.breeds || hoveredDetail.breeds.length === 0) &&
                            (!hoveredDetail.bannedBreeds || hoveredDetail.bannedBreeds.length === 0) && (
                                <Typography sx={{color: '#8299a1', fontSize: '0.85rem'}}>
                                    {t('tournament.admin.teams.noComposition')}
                                </Typography>
                            )}
                    </Box>
                )}
            </Popover>
        </Box>
    );
}


