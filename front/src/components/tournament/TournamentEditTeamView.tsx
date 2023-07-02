import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {Trans, useTranslation} from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {useLoaderData, useParams} from "react-router-dom";
import {ChangeEvent, useEffect, useState} from "react";
import {TournamentDefinition, TournamentTeamModel} from "../../chore/tournament.ts";
import Button from "@mui/material/Button";
import {getTeamApplications, getTournamentTeam, putEditTeam} from "../../services/tournament.ts";
import {useRecoilValue, useSetRecoilState} from "recoil";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {loginIdState} from "../../atoms/atoms-header.ts";
import {snackState} from "../../atoms/atoms-snackbar.ts";

type LoaderResponse = {
    tournament: TournamentDefinition
}

export default function TournamentEditTeamView() {
    const {t} = useTranslation();
    const {id, teamId} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const me = useRecoilValue(loginIdState);
    const isAdmin = tournament.admins.includes(me);
    const isStarted = Date.parse(tournament.startDate).toString() < Date.now().toString();
    const setSnackValue = useSetRecoilState(snackState)

    const [pickedServer, setPickedServer] = useState('')
    const [errors, setErrors] = useState<string[]>();
    const [team, setTeam] = useState<TournamentTeamModel>({
        tournament: id,
        catchPhrase: "",
        name: "",
        server: "",
        displayOnTeamList: true
    } as TournamentTeamModel);
    const [applications, setTeamApplications] = useState([]);
    const servers = ["Pandora", "Rubilax"];

    useEffect(() => {
        if (!teamId) return;

        getTournamentTeam(id || "", teamId).then(response => {
            setTeam(response.team)
            setPickedServer(servers.indexOf(response.team.server) as any)
        })

        getTeamApplications(id || "", teamId).then(response => {
            setTeamApplications(response.applications)
        })
    }, [teamId])

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

    function save() {
        const toSend = {...team};

        putEditTeam(id || "", toSend).then(() => {
            setSnackValue({
                severity: "success",
                message: t('saved') as string,
                open: true
            });
        });
    }

    function validateTournamentTeam(team: TournamentTeamModel): string[] | undefined {
        const errors = [];

        if (!team.name || team.name.length <= 0) errors.push("tournament.errors.missing.name");
        if (team.name && team.name.length > 25) errors.push("tournament.errors.too.big.name");
        if (team.players && team.players.length > 6) errors.push('tournament.errors.teamTooBig');
        if (!servers.includes(team.server)) errors.push("tournament.errors.badServer");
        if (team.catchPhrase && team.catchPhrase.length > 75) errors.push("tournament.errors.too.big.catchPhrase");

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
                    <Trans i18nKey="tournament.team.register.editTitle"
                           components={{span: <span className="blueWord"/>}}/>
                </Typography>
            </Grid>
            <Grid item lg={4} xs={0} sx={{justifyContent: "flex-end"}} display={{xs: 'none', md: 'flex'}}>
                <img src="/images/osamodas_registration.png" alt="Osamodas"/>
            </Grid>
            <Grid item lg={8} xs={12} sx={{textAlign: "start", pl: 4, pr: 4}}>
                <Grid container>
                    <Grid item xs={6} sx={{p: 1}}>
                        <TextField sx={{width: '100%'}} label={t('tournament.team.register.name')}
                                   id="name" disabled={!isAdmin}
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
                            <Typography key={error}>{t(error)}</Typography>
                        ))}
                    </Grid>
                    <Grid item xs={12} sx={{p: 1}}>
                        <FormControlLabel control={
                            <Checkbox checked={team.displayOnTeamList} disabled={isStarted}
                                      onChange={(event: ChangeEvent<HTMLInputElement>) => setTeam({
                                          ...team,
                                          displayOnTeamList: event.target.checked
                                      })}/>
                        } label={t('tournament.team.displayOnTeamList')}/>
                        <Button onClick={save}
                                sx={{
                                    backgroundColor: "#4a7cb1", color: "#fefdff", display: "inline-block", width: 1,
                                    '&.Mui-disabled': {
                                        backgroundColor: "rgba(74,124,177,0.2)",
                                        color: '#fefdff'
                                    }
                                }}
                                disabled={(errors && errors.length > 0) || !team.name}>{t("tournament.team.register.saveButton")}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}