import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {postMatchesSearch, teamSearch} from "../../services/tournament.ts";
import {TournamentMatchModel} from "../../chore/tournament.ts";

interface BracketMatch {
    match: TournamentMatchModel;
    teamAName: string;
    teamBName: string;
}

interface BracketRound {
    round: number;
    matches: BracketMatch[];
    label: string;
}

const MATCH_HEIGHT = 52;
const CONNECTOR_WIDTH = 24;

export default function TournamentBracketTree({phase}: { phase: number }) {
    const {t} = useTranslation();
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [rounds, setRounds] = useState<BracketRound[]>([]);
    const [thirdPlaceMatch, setThirdPlaceMatch] = useState<BracketMatch | null>(null);

    useEffect(() => {
        if (!id || phase <= 0) return;

        async function loadBracket() {
            setLoading(true);
            try {
                const response = await postMatchesSearch(id!, {type: "RESULTS", phase});
                const allMatches: TournamentMatchModel[] = response?.matches || [];

                const planningResponse = await postMatchesSearch(id!, {type: "PLANNING", phase});
                const planningMatches: TournamentMatchModel[] = planningResponse?.matches || [];

                const mergedMap = new Map<string, TournamentMatchModel>();
                for (const m of [...planningMatches, ...allMatches]) {
                    if (m.id) mergedMap.set(m.id, m);
                }
                const matches = Array.from(mergedMap.values());

                if (matches.length === 0) {
                    setRounds([]);
                    setLoading(false);
                    return;
                }

                const teamIds = new Set<string>();
                for (const m of matches) {
                    if (m.teamA) teamIds.add(m.teamA);
                    if (m.teamB) teamIds.add(m.teamB);
                }

                const teamsMap = new Map<string, string>();
                if (teamIds.size > 0) {
                    const teamsResponse = await teamSearch(id!, Array.from(teamIds));
                    if (teamsResponse?.teams) {
                        for (const team of teamsResponse.teams) {
                            teamsMap.set(team.id, team.name);
                        }
                    }
                }

                const roundMap = new Map<number, BracketMatch[]>();
                let petiteFinale: BracketMatch | null = null;

                for (const m of matches) {
                    const bracketMatch: BracketMatch = {
                        match: m,
                        teamAName: m.teamA ? (teamsMap.get(m.teamA) || m.teamA) : t('bracket.noOpponent'),
                        teamBName: m.teamB ? (teamsMap.get(m.teamB) || m.teamB) : t('bracket.noOpponent'),
                    };

                    if (m.thirdPlaceMatch) {
                        petiteFinale = bracketMatch;
                        continue;
                    }

                    const round = m.round || 1;
                    if (!roundMap.has(round)) roundMap.set(round, []);
                    roundMap.get(round)!.push(bracketMatch);
                }

                const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => a - b);
                const bracketRounds: BracketRound[] = sortedRounds.map(roundNum => {
                    const matchesInRound = roundMap.get(roundNum)!;
                    // Sort by matchIndex to preserve seed order across rounds
                    matchesInRound.sort((a, b) => (a.match.matchIndex ?? 0) - (b.match.matchIndex ?? 0));
                    return {
                        round: roundNum,
                        matches: matchesInRound,
                        label: getRoundLabel(roundNum, sortedRounds.length, matchesInRound.length, t),
                    };
                });

                setRounds(bracketRounds);
                setThirdPlaceMatch(petiteFinale);
            } catch (e) {
                console.error("Failed to load bracket", e);
                setRounds([]);
            } finally {
                setLoading(false);
            }
        }

        loadBracket();
    }, [id, phase]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (rounds.length === 0) {
        return (
            <Box sx={{p: 3}}>
                <Typography variant="h6" sx={{textAlign: 'center', color: '#8299a1'}}>
                    {t('bracket.noStandings')}
                </Typography>
            </Box>
        );
    }

    // Calculate total height based on first round match count
    const firstRoundMatchCount = rounds[0]?.matches.length || 1;
    const totalHeight = Math.max(500, firstRoundMatchCount * (MATCH_HEIGHT + 12));

    return (
        <>
            {/* Scrollable bracket area */}
            <Box sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                width: '100%',
                height: `calc(100vh - 200px)`,
                minHeight: totalHeight,
            }}>
                {/* Bracket tree */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'stretch',
                    height: '100%',
                    minWidth: rounds.length * 220 + (rounds.length - 1) * CONNECTOR_WIDTH,
                }}>
                    {rounds.map((round, roundIndex) => (
                        <Box key={round.round} sx={{display: 'flex', alignItems: 'stretch'}}>
                            {/* Round column */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 200,
                                flex: '0 0 auto',
                            }}>
                                {/* Round header */}
                                <Typography variant="subtitle2" sx={{
                                    textAlign: 'center',
                                    color: '#8299a1',
                                    py: 1,
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.05em',
                                    flexShrink: 0,
                                }}>
                                    {round.label}
                                </Typography>

                                {/* Matches */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-around',
                                    flex: 1,
                                }}>
                                    {round.matches.map((bracketMatch, matchIndex) => (
                                        <BracketMatchCard
                                            key={bracketMatch.match.id || matchIndex}
                                            bracketMatch={bracketMatch}
                                            tournamentId={id!}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* Connector column between rounds */}
                            {roundIndex < rounds.length - 1 && (
                                <ConnectorColumn
                                    matchCount={round.matches.length}
                                />
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Third place match — rendered outside the height-constrained area so it is always visible */}
            {thirdPlaceMatch && (
                <Box sx={{mt: 3, pt: 2, borderTop: '1px solid #2a4a5a'}}>
                    <Typography variant="subtitle2" sx={{
                        textAlign: 'center',
                        color: '#8299a1',
                        mb: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em',
                    }}>
                        {t('bracket.thirdPlace')}
                    </Typography>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Box sx={{width: 200}}>
                            <BracketMatchCard
                                bracketMatch={thirdPlaceMatch}
                                tournamentId={id!}
                            />
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    );
}

/**
 * Draws connector lines between rounds: horizontal lines from each match,
 * vertical merge lines, and horizontal lines to the next round.
 */
function ConnectorColumn({matchCount}: { matchCount: number }) {
    // Each pair of matches connects to one match in the next round
    const pairs = Math.floor(matchCount / 2);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            width: CONNECTOR_WIDTH,
            flex: '0 0 auto',
            pt: '28px', // offset for header
        }}>
            {Array.from({length: pairs}).map((_, i) => (
                <Box key={i} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    position: 'relative',
                }}>
                    {/* Top horizontal line (from top match) */}
                    <Box sx={{
                        position: 'absolute',
                        top: '25%',
                        left: 0,
                        width: '50%',
                        height: 0,
                        borderTop: '1px solid #3a5a6a',
                    }}/>
                    {/* Bottom horizontal line (from bottom match) */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: '25%',
                        left: 0,
                        width: '50%',
                        height: 0,
                        borderTop: '1px solid #3a5a6a',
                    }}/>
                    {/* Vertical merge line */}
                    <Box sx={{
                        position: 'absolute',
                        top: '25%',
                        bottom: '25%',
                        left: '50%',
                        width: 0,
                        borderLeft: '1px solid #3a5a6a',
                    }}/>
                    {/* Output horizontal line (to next round) */}
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '50%',
                        height: 0,
                        borderTop: '1px solid #3a5a6a',
                    }}/>
                </Box>
            ))}
        </Box>
    );
}

function BracketMatchCard({bracketMatch, tournamentId}: {
    bracketMatch: BracketMatch;
    tournamentId: string;
}) {
    const {match, teamAName, teamBName} = bracketMatch;
    const isTeamAWinner = match.winner === match.teamA;
    const isTeamBWinner = match.winner === match.teamB;
    const hasWinner = !!match.winner;

    return (
        <Link to={`/tournament/${tournamentId}/tab/4/match/${match.id}`} style={{textDecoration: 'none', display: 'block'}}>
            <Box sx={{
                backgroundColor: '#1a3040',
                borderRadius: '4px',
                border: '1px solid #2a4a5a',
                overflow: 'hidden',
                mx: 0.5,
                height: MATCH_HEIGHT,
                transition: 'border-color 0.2s',
                '&:hover': {
                    borderColor: '#00ead1',
                }
            }}>
                {/* Team A */}
                <TeamRow
                    name={teamAName}
                    isWinner={isTeamAWinner}
                    isLoser={hasWinner && !isTeamAWinner}
                    score={match.rounds?.filter(r => r.winner === match.teamA).length ?? 0}
                    showScore={!!match.rounds && match.rounds.length > 1}
                    hasBorderBottom
                />
                {/* Team B */}
                <TeamRow
                    name={teamBName}
                    isWinner={isTeamBWinner}
                    isLoser={hasWinner && !isTeamBWinner}
                    score={match.rounds?.filter(r => r.winner === match.teamB).length ?? 0}
                    showScore={!!match.rounds && match.rounds.length > 1}
                    hasBorderBottom={false}
                />
            </Box>
        </Link>
    );
}

function TeamRow({name, isWinner, isLoser, score, showScore, hasBorderBottom}: {
    name: string;
    isWinner: boolean;
    isLoser: boolean;
    score: number;
    showScore: boolean;
    hasBorderBottom: boolean;
}) {
    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            height: MATCH_HEIGHT / 2 - 1,
            px: 1,
            backgroundColor: isWinner ? '#1a3a2a' : '#1a3040',
            borderBottom: hasBorderBottom ? '1px solid #2a4a5a' : 'none',
        }}>
            {/* Fixed-width icon slot to keep names aligned */}
            <Box sx={{width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {isWinner && (
                    <EmojiEventsIcon sx={{fontSize: 12, color: '#07c6b6'}}/>
                )}
            </Box>
            <Typography variant="body2" sx={{
                flex: 1,
                color: isWinner ? '#07c6b6' : (isLoser ? '#6a7a80' : '#e0e0e0'),
                fontWeight: isWinner ? 'bold' : 'normal',
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                ml: 0.5,
            }}>
                {name}
            </Typography>
            {showScore && (
                <Typography variant="caption" sx={{
                    color: isWinner ? '#07c6b6' : '#8299a1',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    ml: 0.5,
                    flexShrink: 0,
                }}>
                    {score}
                </Typography>
            )}
        </Box>
    );
}

function getRoundLabel(round: number, totalRounds: number, matchCount: number, t: (key: string) => string): string {
    if (matchCount === 1 && round === totalRounds) {
        return t('bracket.finale');
    }
    if (matchCount === 2) {
        return t('bracket.semiFinals');
    }
    if (matchCount === 4) {
        return t('bracket.quarterFinals');
    }
    if (matchCount === 8) {
        return t('bracket.roundOf16');
    }
    if (matchCount === 16) {
        return t('bracket.roundOf32');
    }
    if (matchCount === 32) {
        return t('bracket.roundOf64');
    }
    return t('bracket.roundN').replace('{{n}}', String(round));
}
