import {DraftAction, DraftActionType, DraftTeam, DraftTeamInfo, DraftUser} from "../../chore/draft.ts";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {Trans, useTranslation} from "react-i18next";
import {send} from "../../utils/socket.ts";
import {useParams} from "react-router-dom";

type DraftTeamProps = {
    isMyTeam: boolean
    team: DraftTeamInfo,
    users: DraftUser[],
    teamEnum: DraftTeam
    teamReady: boolean,
    otherTeamReady: boolean,
    history?: DraftAction[]
}

export function DraftTeamColumn(props: DraftTeamProps) {
    const {draftId} = useParams();
    const {t} = useTranslation();
    const {isMyTeam, team, users, teamEnum, teamReady, otherTeamReady, history} = props;

    const color = teamEnum === DraftTeam.TEAM_A ? "teamA" : "teamB";

    return (
        <Grid container className="darkBlueContainer" sx={{
            width: "95%",
            height: "100%",
            margin: "auto",
            display: "block"
        }}>
            <Grid item xs={12} sx={{pt: 1, height: "200px"}}>
                <Typography variant="h5"
                            className={color}
                            sx={{
                                mb: 2,
                            }}>{team.name}</Typography>
                {users && users.filter(u => u.present).map(u => (
                    <Typography key={u.id}>{u.displayName || u.id}</Typography>
                ))}
            </Grid>
            <Grid item xs={12} sx={{p: 2}}>
                {!teamReady && isMyTeam &&
                    <Button sx={{width: "90%"}} variant="contained"
                            onClick={() => send('draft::teamReady', {
                                draftId: draftId,
                                ready: true
                            })}>{t('draft.setTeamReady')}</Button>
                }
                {teamReady && !otherTeamReady && isMyTeam &&
                    <Button sx={{width: "90%"}}
                            onClick={() => send('draft::teamReady', {
                                id: draftId,
                                ready: false
                            })}>{t('draft.setTeamNotReady')}</Button>
                }
                {teamReady && history && history.length > 0 &&
                    <Grid container>
                        {history.filter(e => e.team === teamEnum).map((e, index) => (
                            <Grid item xs={3} md={2} key={index}>
                                <img style={{
                                    width: "100%",
                                    filter: (e.type === DraftActionType.BAN ? "grayscale(1)" : "")
                                }} src={`/classes/${e.breed}_0.png`}
                                     alt={`Breed ${e.breed}`}/>
                                <Trans sx={{position: "relative", top: "0px", left: "0px"}}
                                       i18nKey={e.type === DraftActionType.PICK ? "draft.pick" : "draft.ban"}
                                       components={{
                                           span: <span className={e.type === DraftActionType.PICK ? "pick" : "ban"}
                                                       style={{
                                                           fontWeight: "bold"
                                                       }}/>
                                       }}/>
                            </Grid>
                        ))}
                    </Grid>
                }
            </Grid>
        </Grid>
    )
}