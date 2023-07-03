import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from "@mui/icons-material/Delete";
import {Trans, useTranslation} from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {useLoaderData, useParams} from "react-router-dom";
import {ChangeEvent, useEffect, useState} from "react";
import {TournamentDefinition, TournamentTeamModel} from "../../chore/tournament.ts";
import Button from "@mui/material/Button";
import {
    acceptApplication,
    deleteApplication,
    deleteTeam,
    deleteTeamPlayer,
    getTeamApplications,
    getTournamentTeam,
    putEditTeam
} from "../../services/tournament.ts";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import {loginIdState} from "../../atoms/atoms-header.ts";
import {snackState} from "../../atoms/atoms-snackbar.ts";
import Divider from "@mui/material/Divider";
import {accountCacheState} from "../../atoms/atoms-accounts.ts";
import {accountsLoader} from "../../services/account.ts";

type LoaderResponse = {
    tournament: TournamentDefinition
}

type Application = {
    id: string;
    userId: string;
    username: string;
}

export default function TournamentEditTeamView() {
    const {t} = useTranslation();
    const {id, teamId} = useParams();
    const tournament = (useLoaderData() as LoaderResponse).tournament;
    const [accounts, setAccounts] = useRecoilState(accountCacheState);
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
    const [applications, setTeamApplications] = useState<Application[]>([]);
    const servers = ["Pandora", "Rubilax"];

    useEffect(() => {
        if (!teamId) return;

        getTournamentTeam(id || "", teamId).then(response => {
            setTeam(response.team)
            setPickedServer(servers.indexOf(response.team.server) as any)

            const toLoad = [...response.team.validatedPlayers];
            const accountsToRequest = toLoad.filter(accountId => !accounts.get(accountId));
            if (accountsToRequest.length <= 0) return;
            accountsLoader(accountsToRequest).then((response) => {
                const newCache = new Map(accounts);
                for (const account of response.accounts) {
                    newCache.set(account.id, account.displayName);
                }
                setAccounts(newCache);
            });
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

    function acceptApplicationInView(application: Application) {
        acceptApplication(id || "", teamId || "", application.id)
        const newAccounts = new Map(accounts);
        newAccounts.set(application.userId, application.username)
        setAccounts(newAccounts);
        setTeam({
            ...team,
            validatedPlayers: [...team.validatedPlayers, application.userId]
        })
        setTeamApplications(applications.filter(application => application.id !== application.id))
    }

    function rejectApplication(applicationId: string) {
        deleteApplication(id || "", teamId || "", applicationId)
            .then(() => setTeamApplications(applications.filter(application => application.id !== applicationId)))
    }

    function removeUser(userId: string) {
        deleteTeamPlayer(id || "", teamId || "", userId)
            .then(() => setTeam({
                ...team,
                validatedPlayers: team.validatedPlayers.filter(player => player !== userId)
            }));

    }

    function deleteTeamInView() {
        if (!window.confirm(t('tournament.team.confirmDeletion') as string)) return;

        deleteTeam(id || "", teamId || "")
            .then(() => window.location.href = `/tournament/${id}`)
    }

    function validateTournamentTeam(team: TournamentTeamModel): string[] | undefined {
        const errors = [];

        if (!team.name || team.name.length <= 0) errors.push("error.missing.name");
        if (team.name && team.name.length > 25) errors.push("error.too.big.name");
        if (team.players && team.players.length > 6) errors.push('error.teamTooBig');
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
                    <Trans i18nKey="tournament.team.register.editTitle"
                           components={{span: <span className="blueWord"/>}}/>
                </Typography>
            </Grid>
            <Grid item lg={4} xs={0} sx={{justifyContent: "flex-end"}} display={{xs: 'none', lg: 'flex'}}>
                <img src="/images/osamodas_registration.png" alt="Osamodas"/>
            </Grid>
            <Grid item lg={8} xs={12} sx={{textAlign: "start", pl: 4, pr: 4}}>
                <Grid container sx={{alignItems: "center"}}>
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
                            <Typography color="error" key={error}>{t(error)}</Typography>
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
                        <Button onClick={save} variant="contained"
                                sx={{width: 1}}
                                disabled={(errors && errors.length > 0) || !team.name}>{t("tournament.team.register.saveButton")}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} lg={6}
                  sx={{display: (team && team.validatedPlayers && team.validatedPlayers.length > 0 ? "block" : "none")}}>
                <Typography variant="h4" sx={{mt: 3}}>{t('tournament.team.members')}</Typography>
                <Stack direction='column'
                       sx={{borderRadius: 2, border: '1px solid #03c8be', mt: 1, ml: {xs: 1, lg: 3}, mr: 1}}
                       divider={<Divider sx={{ml: 1, mr: 1}} orientation="horizontal" variant="middle" flexItem/>}
                >
                    {team && team.validatedPlayers && team.validatedPlayers.map((player, index) => (
                        <Grid container alignItems="center">
                            <Grid item xs={9} key={index}>
                                {accounts.get(player) || player}
                            </Grid>
                            <Grid item xs={3}>
                                <Button color="error" disabled={me === player}
                                        onClick={() => removeUser(player)}><DeleteIcon/></Button>
                            </Grid>
                        </Grid>
                    ))}
                </Stack>
            </Grid>
            <Grid item xs={12} lg={6} sx={{display: (applications && applications.length > 0 ? "block" : "none")}}>
                <Typography variant="h4" sx={{mt: 3}}>{t('tournament.team.appliants')}</Typography>
                <Stack direction='column'
                       sx={{borderRadius: 2, border: '1px solid #03c8be', mt: 1, ml: 1, mr: {xs: 1, lg: 3}}}
                       divider={<Divider sx={{ml: 1, mr: 1}} orientation="horizontal" variant="middle" flexItem/>}
                >
                    {applications && applications.map((application, index) => (
                        <Grid container alignItems="center">
                            <Grid item xs={6} key={index}>
                                {application.username}
                            </Grid>
                            <Grid item xs={3}>
                                <Button color="success"
                                        onClick={() => acceptApplicationInView(application)}><CheckIcon/></Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Button color="error"
                                        onClick={() => rejectApplication(application.id)}><DeleteIcon/></Button>
                            </Grid>
                        </Grid>
                    ))}
                </Stack>
            </Grid>
            <Grid item xs={12} sx={{display: isAdmin ? "block" : "none"}}>
                <Button variant="contained" sx={{mt: 4, mr: 1, float: 'right'}} color="error"
                        onClick={() => deleteTeamInView()}>{t('tournament.team.delete')}</Button>
            </Grid>
        </Grid>
    )
}