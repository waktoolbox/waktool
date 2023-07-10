import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import {TournamentMatchModel} from "../../chore/tournament.ts";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {teamCacheState} from "../../atoms/atoms-tournament.ts";
import {useRecoilValue} from "recoil";
import {dateFormat} from "../../utils/date.ts";

type TournamentMatchInlinedViewProps = {
    backgroundColor: string
    displayedTeam?: string,
    match: TournamentMatchModel;
}

export default function TournamentMatchInlinedView(props: TournamentMatchInlinedViewProps) {
    const {t} = useTranslation();
    const {id, teamId} = useParams();
    const {backgroundColor, displayedTeam, match} = props;

    const teamCache = useRecoilValue(teamCacheState);
    const displayedTeamName = teamCache.get(displayedTeam || match.teamA)
    const otherTeamName = teamCache.get(!displayedTeam || match.teamA === displayedTeam ? match.teamB : match.teamA)

    return (
        <Card sx={{
            mt: 3, mr: 2,
            borderRadius: 4,
            boxShadow: '5px 5px 15px 0px #000000',
            '&.MuiCardContent-root': {p: 2},
        }}>
            <CardContent sx={{
                backgroundColor: backgroundColor, textAlign: "start",
                "&:last-child": {
                    pb: 2
                }
            }}>
                <Grid container direction="row" alignItems="center">
                    {displayedTeam && match.winner &&
                        <Grid item xs={1}>
                            {match.winner && match.winner === displayedTeam &&
                                <EmojiEventsIcon sx={{
                                    width: "80%",
                                    height: '80%',
                                    display: "flex",
                                    verticalAlign: "middle",
                                    color: "#07c6b6"
                                }}/>
                            }
                            {match.winner && match.winner !== displayedTeam &&
                                <CancelIcon sx={{
                                    width: "80%",
                                    height: '80%',
                                    display: "flex",
                                    verticalAlign: "middle",
                                    color: "#e64b4b"
                                }}/>
                            }
                        </Grid>
                    }
                    <Grid item xs={displayedTeam && !match.winner ? 5 : 4} sx={{mt: "2px"}}>
                        <Typography>
                            <b>{!match.date ? t('tournament.match.noDate') : t('date', {
                                date: Date.parse(match.date),
                                formatParams: dateFormat
                            })}</b>
                        </Typography>
                        <Typography sx={{color: "#848889", whiteSpace: "pre-line"}}>
                            {match.rounds && match.rounds.map((r, i) => `${i + 1}. ` + t(`maps.${r.map}`) + "\n")}
                        </Typography>
                    </Grid>
                    <Grid item xs={displayedTeam ? 5 : 6} sx={{height: "100%"}}>
                        <Divider sx={{pt: 2, pb: 3, m: 0, mr: 2, display: "inline"}} orientation="vertical"
                                 variant="middle"/>
                        {displayedTeamName &&
                            <Link to={`/tournament/${id}/tab/2/team/${match.teamA}`}>
                                <Typography variant="h6" sx={{verticalAlign: "middle"}} display="inline">
                                    {!displayedTeam && match.winner === match.teamA &&
                                        <EmojiEventsIcon sx={{
                                            mr: 1,
                                            mb: "3px",
                                            height: '100%',
                                            verticalAlign: "middle",
                                            color: "#07c6b6"
                                        }}/>
                                    }
                                    {!displayedTeam && match.winner === match.teamB &&
                                        <CancelIcon sx={{
                                            mr: 1,
                                            mb: "3px",
                                            height: '100%',
                                            verticalAlign: "middle",
                                            color: "#e64b4b"
                                        }}/>
                                    }
                                    <b>{displayedTeamName}</b>
                                </Typography>
                            </Link>
                        }
                        <Typography sx={{verticalAlign: "middle", ml: (displayedTeamName ? 1 : 0), mr: 1}}
                                    display="inline">
                            <span className="blueWord">vs</span>
                        </Typography>

                        <Link
                            to={`/tournament/${id}/tab/2/team/${!teamId || teamId === match.teamA ? match.teamB : match.teamA}`}>
                            <Typography variant="h6" sx={{verticalAlign: "middle"}} display="inline">
                                <b>{otherTeamName}</b>
                                {!displayedTeam && match.winner === match.teamB &&
                                    <EmojiEventsIcon sx={{
                                        ml: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle",
                                        color: "#07c6b6"
                                    }}/>
                                }
                                {!displayedTeam && match.winner === match.teamA &&
                                    <CancelIcon sx={{
                                        ml: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle",
                                        color: "#e64b4b"
                                    }}/>
                                }
                            </Typography>
                        </Link>
                    </Grid>
                    <Grid item xs={2}>
                        <Link to={`/tournament/${id}/tab/4/match/${match.id}`}>
                            <Button sx={{
                                borderColor: '#00ead1 !important',
                                color: '#fefffa',
                                backgroundColor: '#213a41',
                                fontSize: "0.6rem",
                                float: "right"
                            }} variant="outlined">
                                {t('tournament.match.more')}
                            </Button>
                        </Link>

                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )

}