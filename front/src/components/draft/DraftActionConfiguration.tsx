import {DraftAction, DraftActionType, DraftTeam} from "../../chore/draft.ts";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {SelectChangeEvent} from "@mui/material/Select/SelectInput";
import {Trans, useTranslation} from "react-i18next";
import {ChangeEvent} from "react";

type DraftActionConfiguration = {
    action: DraftAction
    setAction: (apply: (a: DraftAction) => void) => void
    deleteAction: () => void
}

export function DraftActionConfiguration(props: DraftActionConfiguration) {
    const {action, setAction, deleteAction} = props;
    const {t} = useTranslation();

    const colorClass = action.team === DraftTeam.TEAM_A ? "teamA" : "teamB";
    const actionColorClass = action.type === DraftActionType.PICK ? "pick" : "ban";

    return (
        <>
            <Grid container>
                <Grid item xs={6} md={2}>
                    <Select value={action.team as unknown as string} label={t('draft.team')}
                            className={colorClass}
                            sx={{fontWeight: 'bold', m: 1}}
                            onChange={(event: SelectChangeEvent) => {
                                setAction(a => a.team = event.target.value as unknown as DraftTeam || DraftTeam.TEAM_A)
                            }}>
                        <MenuItem value={DraftTeam.TEAM_A} className={colorClass}>{t('draft.teamA')}</MenuItem>
                        <MenuItem value={DraftTeam.TEAM_B} className={colorClass}>{t('draft.teamB')}</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={6} md={2}>
                    <Select value={action.type as unknown as string} label={t('draft.type')}
                            className={actionColorClass}
                            sx={{fontWeight: 'bold', m: 1}}
                            onChange={(event: SelectChangeEvent) => {
                                setAction(a => a.type = event.target.value as unknown as DraftActionType || DraftActionType.PICK);
                            }}>
                        <MenuItem value={DraftActionType.PICK} className={actionColorClass}>
                            <Trans i18nKey={'draft.pick'} components={{span: <span/>}}/>
                        </MenuItem>
                        <MenuItem value={DraftActionType.BAN} className={actionColorClass}>
                            <Trans i18nKey={'draft.ban'} components={{span: <span/>}}/>
                        </MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={4} md={3}>
                    <FormControlLabel control={
                        <Checkbox checked={action.lockForPickingTeam}
                                  onChange={(event: ChangeEvent<HTMLInputElement>) => setAction(a => a.lockForPickingTeam = event.target.checked)}/>
                    } label={t('draft.lockForPicking')}/>
                </Grid>
                <Grid item xs={4} md={3}>
                    <FormControlLabel control={
                        <Checkbox checked={action.lockForOpponentTeam}
                                  onChange={(event: ChangeEvent<HTMLInputElement>) => setAction(a => a.lockForOpponentTeam = event.target.checked)}/>
                    } label={t('draft.lockForOpponent')}/>
                </Grid>
                <Grid item xs={4} md={2}>
                    <Button color="error" onClick={() => deleteAction()}><DeleteIcon/></Button>
                </Grid>
            </Grid>
        </>
    )
}