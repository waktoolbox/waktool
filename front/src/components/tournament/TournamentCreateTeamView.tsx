import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {Trans, useTranslation} from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {useNavigate, useParams} from "react-router-dom";
import {ChangeEvent, useState} from "react";
import {TournamentTeamModel} from "../../chore/tournament.ts";
import Button from "@mui/material/Button";
import {postRegisterTeam} from "../../services/tournament.ts";
import {useRecoilState, useSetRecoilState} from "recoil";
import {myTournamentTeamState} from "../../atoms/atoms-tournament.ts";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {snackState} from "../../atoms/atoms-snackbar.ts";

export default function TournamentCreateTeamView() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const {id} = useParams();
    const [_, setMyTournamentTeam] = useRecoilState(myTournamentTeamState);
    const setSnackValue = useSetRecoilState(snackState);

    const [pickedServer, setPickedServer] = useState('')
    const [errors, setErrors] = useState<string[]>();
    const [team, setTeam] = useState<TournamentTeamModel>({
        tournament: id,
        catchPhrase: "",
        name: "",
        server: "",
        displayOnTeamList: true
    } as TournamentTeamModel);
    const servers = ["Pandora", "Rubilax"];

    const setServer = (newServer: string) => {
        setPickedServer(newServer)
        setTeam({
            ...team,
            server: servers[newServer as any]
        })
        setErrors(validateTournamentTeam({
            ...team,
            server: servers[newServer as any]
        }));
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTeam({
            ...team,
            [event.target.id]: event.target.value
        })
        setErrors(validateTournamentTeam({
            ...team,
            [event.target.id]: event.target.value
        }));
    }

    function registerTeam() {
        const toSend = {...team};

        postRegisterTeam(id || "", toSend).then(response => {
            if (!response.success) {
                setSnackValue({
                    severity: "error",
                    message: t(response.error) as string,
                    open: true,
                })
                return;
            }
            setMyTournamentTeam(response.team)
            navigate(`/tournament/${id}/tab/2/team/${response.team.id}`)
        })

    }

    function validateTournamentTeam(team: TournamentTeamModel): string[] | undefined {
        const errors = [];

        if (!team.name || team.name.length <= 0) errors.push("error.missing.name");
        if (team.name && team.name.length > 25) errors.push("error.too.big.name");
        if (!servers.includes(team.server)) errors.push("error.badServer");
        if (team.catchPhrase && team.catchPhrase.length > 75) errors.push("error.too.big.catchPhrase");

        return errors.length <= 0 ? undefined : errors;
    }

    return (
        <Grid container>
            <Grid item xs={12} sx={{
                width: '100%',
                height: '100px',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase"
            }}>
                <Typography variant="h4">
                    <Trans i18nKey="tournament.team.register.title" components={{span: <span className="blueWord"/>}}/>
                </Typography>
            </Grid>
            <Grid item lg={4} xs={0} sx={{justifyContent: "flex-end"}} display={{xs: 'none', lg: 'flex'}}>
                <img src="/images/osamodas_registration.png" alt="Osamodas"/>
            </Grid>
            <Grid item lg={8} xs={12} sx={{textAlign: "start", pl: 4, pr: 4}}>
                <Grid container>
                    <Grid item xs={6} sx={{p: 1}}>
                        <TextField sx={{width: '100%'}} label={t('tournament.team.register.name')}
                                   id="name"
                                   value={team.name}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={6} sx={{p: 1}}>
                        <TextField sx={{width: '100%', height: "100%"}}
                                   value={pickedServer}
                                   label={t('tournament.team.register.server')}
                                   select
                        >
                            {Object.keys(servers).map((server) => (
                                <MenuItem
                                    key={server}
                                    onClick={() => setServer(server)}
                                    value={server}
                                >
                                    {servers[server as any]}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{p: 1}}>
                        <TextField sx={{width: '100%'}} label={t('tournament.team.register.catchPhrase')}
                                   id="catchPhrase" value={team.catchPhrase}
                                   onChange={handleChange}/>
                    </Grid>
                    <Grid item xs={12} sx={{p: 1}}>
                        {errors && errors.length > 0 && errors.map(error => (
                            <Typography color="error" key={error}>{t(error)}</Typography>
                        ))}
                    </Grid>
                    <Grid item xs={12} sx={{p: 1}}>
                        <FormControlLabel control={
                            <Checkbox checked={team.displayOnTeamList}
                                      onChange={(event: ChangeEvent<HTMLInputElement>) => setTeam({
                                          ...team,
                                          displayOnTeamList: event.target.checked
                                      })}/>
                        } label={t('tournament.team.displayOnTeamList')}/>
                        <Button onClick={registerTeam}
                                sx={{
                                    backgroundColor: "#4a7cb1", color: "#fefdff", display: "inline-block", width: 1,
                                    '&.Mui-disabled': {
                                        backgroundColor: "rgba(74,124,177,0.2)",
                                        color: '#fefdff'
                                    }
                                }}
                                disabled={(errors && errors.length > 0) || !team.name}>{t("tournament.team.register.button")}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}