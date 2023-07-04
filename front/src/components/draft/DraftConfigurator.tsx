import {useState} from "react";
import {send} from "../../utils/socket.ts";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {DraftAction, DraftActionType, DraftTeam, DraftTemplates} from "../../chore/draft.ts";
import {useTranslation} from "react-i18next";
import {DraftActionConfiguration} from "./DraftActionConfiguration.tsx";

function DraftConfigurator() {
    const {t} = useTranslation();
    const [actions, setActions] = useState<DraftAction[]>([...DraftTemplates[0].actions]);
    const [draftTemplate, setDraftTemplate] = useState(0);


    function addAction() {
        setActions([
            ...actions,
            {
                type: DraftActionType.PICK,
                team: DraftTeam.TEAM_A,
                lockForPickingTeam: false,
                lockForOpponentTeam: false
            }
        ])
    }

    function updateAction(action: DraftAction, apply: (a: DraftAction) => void): void {
        const tmpActions = [...actions];
        const index = tmpActions.indexOf(action);
        apply(tmpActions[index])
        setActions(tmpActions);
    }

    function deleteAction(action: DraftAction) {
        const tmpActions = [...actions];
        const index = tmpActions.indexOf(action);
        tmpActions.splice(index, 1);
        setActions(tmpActions);
    }

    function requestDraft() {
        send("draft::create", {actions: actions})
    }

    return (
        <Grid container className="darkBlueContainer" sx={{alignItems: "center", pt: 2}}>
            <Grid item xs={6} md={3} order={{xs: 3, md: 1}}>
                <Button variant="outlined" onClick={() => addAction()}>{t('draft.action.add')}</Button>
            </Grid>
            <Grid item xs={12} md={5} order={{xs: 1, md: 2}}>
                <TextField size="small" sx={{float: "right", mr: 1}} value={draftTemplate as unknown as string}
                           label={t('draft.template')} select>
                    {DraftTemplates.map((template, index) => (
                        <MenuItem key={index} value={index}
                                  onClick={() => setDraftTemplate(index)}>{template.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={2} md={1} order={{xs: 2, md: 3}}>
                <Button
                    onClick={() => setActions([...DraftTemplates[draftTemplate].actions])}>{t('draft.importTemplate')}</Button>
            </Grid>
            <Grid item xs={6} md={3} order={{xs: 4, md: 4}}>
                <Button variant="contained" sx={{height: '100%'}}
                        onClick={() => requestDraft()}>{t('draft.start')}</Button>
            </Grid>
            <Grid item xs={12} order={{xs: 5, md: 5}}>
                <Divider sx={{m: 2}}/>
                {actions && actions.map((action, index) => (
                    <DraftActionConfiguration
                        key={index}
                        action={action}
                        setAction={(func: (a: DraftAction) => void) => updateAction(action, func)}
                        deleteAction={() => deleteAction(action)}
                    />
                ))}
            </Grid>
        </Grid>
    )
}

export default DraftConfigurator;