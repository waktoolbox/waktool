import Typography from "@mui/material/Typography";
import {DraftAction, DraftActionType, DraftTeam} from "../../chore/draft.ts";
import {Trans, useTranslation} from "react-i18next";

type DraftActionProps = {
    action: DraftAction,
}

export function DraftActionView(props: DraftActionProps) {
    const {t} = useTranslation();
    const {action} = props;

    const teamA = action.team === DraftTeam.TEAM_A;
    const teamColorClass = teamA ? "teamA" : "teamB";

    const actionName = action.type === DraftActionType.PICK ? "draft.pickDesc" : "draft.banDesc"
    const actionColorClass = action.type === DraftActionType.PICK ? "pick" : "ban";

    let lockType;
    if (action.lockForPickingTeam && action.lockForOpponentTeam) lockType = "Both"
    else if (action.lockForOpponentTeam) lockType = "Opponent"
    else if (action.lockForPickingTeam) lockType = "Own"
    else lockType = "None"

    const lockText = "draft.lockFor" + lockType + "Desc";

    return (
        <Typography variant="h6" sx={{m: 1, textAlign: "start", ml: 4}}>
            <span className={teamColorClass}>{t(teamA ? 'draft.teamA' : 'draft.teamB')} </span>
            <Trans i18nKey={actionName}
                   components={{span: <span className={actionColorClass} style={{fontWeight: "bold"}}/>}}/>
            <span> {t(lockText)}</span>
        </Typography>
    )
}