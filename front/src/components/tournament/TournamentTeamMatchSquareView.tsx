import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import {TournamentMatchModel} from "../../chore/tournament.ts";
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {teamCacheState} from "../../atoms/atoms-tournament.ts";
import {useRecoilValue} from "recoil";
import {dateFormat} from "../../utils/date.ts";

type TournamentTeamMatchSquareViewProps = {
    backgroundColor: string
    match: TournamentMatchModel;
}

export default function TournamentTeamMatchSquareView(props: TournamentTeamMatchSquareViewProps) {
    const {t} = useTranslation();
    const {id} = useParams();
    const {backgroundColor, match} = props;

    const teamCache = useRecoilValue(teamCacheState);

    return (
        <Card sx={{
            mt: 3, mr: 1, mb: 3,
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
                    <Grid item xs={12} sx={{mt: "2px"}}>

                        <Link to={`/tournament/${id}/tab/2/team/${match.teamA}`}>
                            <Typography variant="h6" sx={{
                                textAlign: "start",
                                verticalAlign: "middle",
                                color: match.winner === match.teamA ? '#07c6b6' : "#e64b4b"
                            }}>
                                {match.winner === match.teamA &&
                                    <EmojiEventsIcon sx={{
                                        mr: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle"
                                    }}/>
                                }
                                {match.winner === match.teamB &&
                                    <CancelIcon sx={{
                                        mr: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle"
                                    }}/>
                                }
                                <b>{teamCache.get(match.teamA) || match.teamA}</b>
                            </Typography>
                        </Link>

                        <Link to={`/tournament/${id}/tab/2/team/${match.teamB}`}>
                            <Typography variant="h6" sx={{
                                textAlign: "start",
                                verticalAlign: "middle",
                                color: match.winner === match.teamB ? '#07c6b6' : "#e64b4b"
                            }}>
                                {match.winner === match.teamB &&
                                    <EmojiEventsIcon sx={{
                                        mr: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle"
                                    }}/>
                                }
                                {match.winner === match.teamA &&
                                    <CancelIcon sx={{
                                        mr: 1,
                                        mb: "3px",
                                        height: '100%',
                                        verticalAlign: "middle"
                                    }}/>
                                }
                                <b>{teamCache.get(match.teamB) || match.teamB}</b>
                            </Typography>
                        </Link>
                    </Grid>
                    <Grid item xs={12} sx={{mt: 1}}>
                        <Typography sx={{textAlign: "center"}}>
                            <b>{!match.date ? t('tournament.match.noDate') : t('date', {
                                date: Date.parse(match.date),
                                formatParams: dateFormat
                            })}</b>
                        </Typography>
                        <Typography sx={{color: "#848889", whiteSpace: "pre-line", textAlign: "center"}}>
                            {match.rounds && match.rounds.map((r, i) => `${i + 1}. ` + t(`maps.${r.map}`) + "\n")}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{mt: 1}} textAlign="center">

                        <Link to={`/tournament/${id}/tab/4/match/${match.id}`}>
                            <Button variant="contained">
                                {t('tournament.match.more')}
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}