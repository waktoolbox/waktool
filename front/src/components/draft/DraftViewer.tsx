import {DraftAction, DraftData, DraftTeam, DraftTeamInfo, DraftUser} from "../../chore/draft.ts";
import {useEffect, useState} from "react";
import {send, subscribeWithoutUserPrefix, unsubscribe} from "../../utils/socket.ts";
import {useRecoilState, useRecoilValue} from "recoil";
import {draftDataState} from "../../atoms/atoms-draft.ts";
import {useLocation, useParams} from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {DraftTeamColumn} from "./DraftTeamColumn.tsx";
import {TimelineEntry} from "./DraftTimelineEntry.tsx";
import {useTranslation} from "react-i18next";
import {Breeds, BreedsArray} from "../../chore/breeds.ts";
import {socketWhoAmIState} from "../../atoms/atoms-socket.ts";
import {DraftActionView} from "./DraftActionView.tsx";
import './DraftViewer.css';

type DraftUserAssigned = {
    user: DraftUser,
    team: DraftTeam
}

type DraftActionWithIndex = {
    draftAction: DraftAction,
    index: number
}

type DraftTeamReady = {
    team: DraftTeam
    ready: boolean
}

type DraftNotification = {
    type: string,
    payload: DraftUser | DraftActionWithIndex | DraftUserAssigned | DraftTeamReady
}

class DataController {
    data: DraftData;
    users?: DraftUser[];
    teamAUsers?: DraftUser[];
    teamBUsers?: DraftUser[];
    history?: DraftAction[];
    currentAction?: number;
    currentActionData?: DraftAction;

    constructor(data: DraftData) {
        this.data = data;
        this.users = data.users;
        this.teamAUsers = data.teamA;
        this.teamBUsers = data.teamB;
        this.history = data.history;
        this.currentAction = data.currentAction;
        this.currentActionData = data.configuration.actions[data.currentAction];
    }
}

let controller: DataController;

function DraftViewer() {
    const {t} = useTranslation();
    const {draftId} = useParams();
    const [draftData, setDraftData] = useRecoilState(draftDataState);
    const whoAmI = useRecoilValue(socketWhoAmIState);
    const location = useLocation();

    // Remote data
    const [users, setUsers] = useState<DraftUser[]>([]);
    const [teamA, setTeamA] = useState<DraftTeamInfo>({} as DraftTeamInfo);
    const [teamAUsers, setTeamAUsers] = useState<DraftUser[]>([]);
    const [teamB, setTeamB] = useState<DraftTeamInfo>({} as DraftTeamInfo);
    const [teamBUsers, setTeamBUsers] = useState<DraftUser[]>([]);
    const [teamAReady, setTeamAReady] = useState(false);
    const [teamBReady, setTeamBReady] = useState(false);
    const [history, setHistory] = useState<DraftAction[]>([]);
    const [currentAction, setCurrentAction] = useState(0)
    const [currentActionData, setCurrentActionData] = useState<DraftAction>({} as DraftAction)

    // Computed data
    const [endReason, setEndReason] = useState<string | undefined>(undefined)
    const [imDraftLeader, setImDraftLeader] = useState(false)
    const [myTeam, setMyTeam] = useState<DraftTeam | undefined>(undefined);
    const [pickedBreed, setPickedBreed] = useState<Breeds | undefined>(undefined);
    const [hoveredBreed, setHoveredBreed] = useState<Breeds | undefined>(undefined);
    const [usersToAssign, setUsersToAssign] = useState<DraftUser[]>([]);

    useEffect(() => {
        if (location.pathname !== "/draft/" + draftId) {
            setDraftData(undefined)
        }
    }, [location.pathname]);

    useEffect(() => {
        if (!draftData) return;
        controller = new DataController(draftData);

        setUsers(controller.users || [])
        setTeamA(controller.data.teamAInfo as DraftTeamInfo)
        setTeamAUsers(controller.teamAUsers || [])
        setTeamB(controller.data.teamBInfo as DraftTeamInfo)
        setTeamBUsers(controller.teamBUsers || [])
        setTeamAReady(controller.data.teamAReady || false)
        setTeamBReady(controller.data.teamBReady || false)
        setHistory(controller.history || [])
        setCurrentAction(controller.currentAction || 0)
        setCurrentActionData(controller.data.configuration?.actions[controller?.currentAction || 0] || undefined)

        setEndReason(undefined) // TODO just to avoid warning, clean when implemented
        setImDraftLeader(controller.data?.configuration?.leader === whoAmI);
    }, [draftData]);

    useEffect(() => {
        if (teamAReady && teamBReady) return;
        computeUsersToAssign()
    }, [users])

    useEffect(() => {
        computeMyTeam()

        if (!teamAReady || !teamBReady) {
            computeUsersToAssign();
        }
    }, [teamAUsers, teamBUsers])

    useEffect(() => {
        subscribeWithoutUserPrefix("/topic/draft-" + draftId, (draftNotification: DraftNotification) => {
            switch (draftNotification.type) {
                case "draft::userJoined": {
                    const user = draftNotification.payload as DraftUser;
                    if (!controller || !controller.users || controller.users.find(u => u.id === user.id)) return;
                    controller.users = [...controller.users, user];
                    setUsers([...controller.users])
                    break;
                }
                case "draft::userAssigned": {
                    const userAssigned = draftNotification.payload as DraftUserAssigned;
                    const team = userAssigned.team === DraftTeam.TEAM_A ? controller?.teamAUsers : controller?.teamBUsers;
                    const setTeam = userAssigned.team === DraftTeam.TEAM_A ? setTeamAUsers : setTeamBUsers;
                    if (!team || team.find(u => u.id === userAssigned.user.id)) return;
                    if (userAssigned.team === DraftTeam.TEAM_A) {
                        controller.teamAUsers = [...(controller?.teamAUsers || []), userAssigned.user];
                    } else {
                        controller.teamBUsers = [...(controller?.teamBUsers || []), userAssigned.user];
                    }
                    setTeam([...((userAssigned.team === DraftTeam.TEAM_A ? controller?.teamAUsers : controller?.teamBUsers) || [])])
                    break;
                }
                case "draft::action": {
                    const actionWithIndex = draftNotification.payload as DraftActionWithIndex;
                    if (!controller.history || actionWithIndex.index !== controller.currentAction) return;
                    controller.history = [...controller.history, actionWithIndex.draftAction]
                    setHistory([...controller.history])
                    controller.currentAction = (controller?.currentAction || 0) + 1;
                    setCurrentActionData(controller.data?.configuration?.actions[controller.currentAction] || undefined)
                    setCurrentAction(controller.currentAction)

                    if (controller.currentAction >= controller.data?.configuration?.actions?.length) {
                        setEndReason("draft.ended");
                    }
                    break;
                }
                case "draft::teamReady": {
                    const teamReady = draftNotification.payload as DraftTeamReady;
                    if (teamReady.team === DraftTeam.TEAM_A) setTeamAReady(teamReady.ready)
                    if (teamReady.team === DraftTeam.TEAM_B) setTeamBReady(teamReady.ready)
                    break;
                }
            }
        });

        return () => {
            unsubscribe("/topic/draft-" + draftId)
        }
    }, [])

    function isClassLockedForCurrentAction(breed: number): boolean {
        if (!breed) return true;
        if (!currentActionData) return true;
        if (currentActionData.team === DraftTeam.TEAM_A) {
            return history.filter(a => a.breed === breed
                && ((a.lockForOpponentTeam && a.team === DraftTeam.TEAM_B) || (a.lockForPickingTeam && a.team === DraftTeam.TEAM_A))
            ).length > 0;
        }
        if (currentActionData.team === DraftTeam.TEAM_B) {
            return history.filter(a => a.breed === breed
                && ((a.lockForOpponentTeam && a.team === DraftTeam.TEAM_A) || (a.lockForPickingTeam && a.team === DraftTeam.TEAM_B))
            ).length > 0;
        }
        console.error("Shouldn't pass here due to previous return");
        return true;
    }

    function computeUsersToAssign() {
        if (teamAReady && teamBReady) return [];
        const result: DraftUser[] = [];
        users.forEach(user => {
            if (teamAUsers?.find(u => u.id === user.id)) return;
            if (teamBUsers?.find(u => u.id === user.id)) return;
            result.push(user);
        })
        setUsersToAssign(result);
    }

    function computeMyTeam() {
        if (teamAUsers?.find(u => u.id === whoAmI)) {
            setMyTeam(DraftTeam.TEAM_A);
            return;
        }
        if (teamBUsers?.find(u => u.id === whoAmI)) {
            setMyTeam(DraftTeam.TEAM_B);
            return;
        }
    }

    return (
        <>
            <Grid item xs={6} lg={3} order={{xs: 2, lg: 1}} sx={{pb: 2}}>
                {teamA &&
                    <DraftTeamColumn
                        isMyTeam={myTeam === DraftTeam.TEAM_A}
                        team={teamA}
                        users={teamAUsers}
                        teamEnum={DraftTeam.TEAM_A}
                        teamReady={teamAReady}
                        otherTeamReady={teamBReady}
                        history={history}
                    />
                }
            </Grid>
            <Grid item xs={6} lg={3} order={{xs: 3, lg: 3}} sx={{pb: 2}}>
                {teamB &&
                    <DraftTeamColumn
                        isMyTeam={myTeam === DraftTeam.TEAM_B}
                        team={teamB}
                        users={teamBUsers}
                        teamEnum={DraftTeam.TEAM_B}
                        teamReady={teamBReady}
                        otherTeamReady={teamAReady}
                        history={history}
                    />
                }
            </Grid>

            <Grid item xs={12} lg={6} order={{xs: 1, lg: 2}} className="darkBlueContainer" sx={{pb: 2, mb: 2}}>
                {(!teamAReady || !teamBReady) && !draftData?.configuration?.providedByServer && (
                    <Grid container>
                        <Grid item xs={12}>
                            <Grid container>
                                {usersToAssign && usersToAssign.map(u => (
                                    <Grid key={u.id} item xs={12} sx={{mt: 2}}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={imDraftLeader ? 4 : 12}>
                                                <Typography>{u.displayName || u.id}</Typography>
                                            </Grid>

                                            {imDraftLeader &&
                                                <Grid item xs={4}>
                                                    <Button
                                                        onClick={() => send('draft::assignUser', {
                                                            draftId: draftId,
                                                            target: u.id,
                                                            team: DraftTeam.TEAM_A
                                                        })}>{t('draft.assignToA')}</Button>
                                                </Grid>
                                            }

                                            {imDraftLeader &&
                                                <Grid item xs={4}>
                                                    <Button
                                                        onClick={() => send('draft::assignUser', {
                                                            draftId: draftId,
                                                            target: u.id,
                                                            team: DraftTeam.TEAM_B
                                                        })}>{t('draft.assignToB')}</Button>
                                                </Grid>
                                            }
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>

                            {(!usersToAssign || usersToAssign.length <= 0) &&
                                <Typography sx={{mt: 2}} variant="h5">{t('draft.noUserToAssign')}</Typography>
                            }
                        </Grid>
                    </Grid>
                )}

                {teamAReady && teamBReady &&
                    <Grid container>
                        {currentActionData &&
                            <Grid item xs={12} sx={{mt: 1}}>
                                <Typography variant="h5">{t('draft.currentAction')}</Typography>
                                {currentActionData && <DraftActionView action={currentActionData}/>}
                            </Grid>
                        }
                        {endReason &&
                            <Grid item xs={12} sx={{mt: 1}}>
                                <Typography variant="h5">{t(endReason)}</Typography>
                            </Grid>
                        }
                        {currentActionData &&
                            <Grid item xs={12} sx={{m: 2, borderRadius: 3}}>
                                <Grid container>
                                    {BreedsArray.map(breed => (
                                        <Grid item key={breed} xs={2}>
                                            <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                                                 style={{width: "95%", borderRadius: 15}}
                                                 className={`draftImage 
                                             ${isClassLockedForCurrentAction(breed) ? 'draftImageDisabled' : ''} 
                                             ${breed === pickedBreed ? "draftImagePicked" : ""}
                                             ${breed === hoveredBreed ? "draftImageHover" : ""}
                                             `}

                                                 onMouseEnter={() => {
                                                     if (currentActionData?.team !== myTeam) return;
                                                     setHoveredBreed(breed);
                                                 }}
                                                 onMouseOut={() => {
                                                     setHoveredBreed(undefined);
                                                 }}
                                                 onClick={() => {
                                                     if (currentActionData?.team !== myTeam) return;
                                                     setPickedBreed(breed)
                                                 }}/>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        }
                        {myTeam && !endReason &&
                            <Grid item xs={12}>
                                <Button disabled={currentActionData?.team !== myTeam} variant="contained"
                                        sx={{width: "95%"}}
                                        onClick={() => {
                                            send('draft::action', {
                                                draftId: draftId, action: {
                                                    ...currentActionData,
                                                    breed: pickedBreed
                                                }
                                            })
                                            setPickedBreed(undefined);
                                            setHoveredBreed(undefined)
                                        }}>
                                    {t('validate')}
                                </Button>
                            </Grid>
                        }

                    </Grid>
                }
            </Grid>

            {draftData && draftData.configuration && draftData.configuration.actions && draftData.configuration.actions.length > 0 && (
                <Grid item xs={12} order={{xs: 4}} className="darkBlueContainer" sx={{pb: 2}}>
                    {draftData.configuration.actions.map((action, index) => (
                        <TimelineEntry key={index} action={action} index={index} currentAction={currentAction}
                                       history={history}/>
                    ))}
                </Grid>
            )}
        </>
    )
}

export default DraftViewer;