import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LooksOneIcon from '@mui/icons-material/LooksOne';

import {Link, useLoaderData, useParams} from "react-router-dom";
import {SyntheticEvent, useEffect, useState} from "react";
import {getMatch, teamSearch} from "../../services/tournament.ts";
import {TournamentDefinition, TournamentMatchModel, TournamentMatchRoundModel} from "../../chore/tournament.ts";
import {useRecoilState, useRecoilValue} from "recoil";
import {myTournamentTeamState, teamCacheState} from "../../atoms/atoms-tournament.ts";
import {useTranslation} from "react-i18next";
import {dateFormat} from "../../utils/date.ts";
import {accountCacheState, streamerCacheState} from "../../atoms/atoms-accounts.ts";
import {DraftTeam} from "../../chore/draft.ts";
import {streamersLoader} from "../../services/account.ts";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentMatchView() {
    const {t} = useTranslation();
    const {id, matchId} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;

    const accounts = useRecoilValue(accountCacheState);
    const myTeam = useRecoilValue(myTournamentTeamState);
    const [teams, setTeamsCache] = useRecoilState(teamCacheState);
    const [streamerCache, setStreamerCache] = useRecoilState(streamerCacheState);

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

    function startDraft(_: DraftTeam | undefined) {
        // TODO maybe be to this here
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
                                        {((!fight.teamADraft && fight.draftDate && Date.parse(fight.draftDate).toString() < Date.now().toString() && (!fight.draftFirstPicker && (match.teamA === myTeam?.id || match.teamB === myTeam?.id))) || (fight.draftId && !fight.teamADraft)) &&
                                            <Button sx={{width: "50%", pt: 2, pb: 2}} disabled={!fight.draftDate}
                                                    onClick={() => startDraft(undefined)}>
                                                {t('tournament.match.goToDraft')}
                                            </Button>
                                        }
                                        {fight.draftFirstPicker && !fight.draftId && !fight.teamADraft && fight.draftDate && Date.parse(fight.draftDate).toString() < Date.now().toString() && fight.draftFirstPicker === myTeam?.id &&
                                            <>
                                                <Button sx={{width: "40%", pt: 2, pb: 2, mr: 1}}
                                                        disabled={!fight.draftDate}
                                                        onClick={() => startDraft(DraftTeam.TEAM_A)}>
                                                    {t('tournament.match.goToDraftTeamA')}
                                                </Button>
                                                <Button sx={{width: "40%", pt: 2, pb: 2, ml: 1}}
                                                        disabled={!fight.draftDate}
                                                        onClick={() => startDraft(DraftTeam.TEAM_B)}>
                                                    {t('tournament.match.goToDraftTeamB')}
                                                </Button>
                                            </>
                                        }
                                        {!fight.teamADraft && ((fight.draftDate && !fight.draftId && ((match.teamA !== myTeam?.id && match.teamB !== myTeam?.id && !fight.draftFirstPicker)
                                                || (fight.draftFirstPicker && fight.draftFirstPicker !== myTeam?.id)))) &&
                                            <Typography
                                                variant="h5">{t('tournament.display.match.draftNotStartedYet')}</Typography>
                                        }
                                        {!fight.teamADraft && fight.draftDate && Date.parse(fight.draftDate).toString() > Date.now().toString() &&
                                            <Typography variant="h5">{t('tournament.display.match.draftDate', {
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
        </Grid>
    )
}