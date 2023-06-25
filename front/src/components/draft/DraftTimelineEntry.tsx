import {DraftAction, DraftActionType, DraftTeam} from "../../chore/draft.ts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveOutlinedIcon from '@mui/icons-material/GroupRemoveOutlined';
import {Trans} from "react-i18next";

type TimelineEntryProps = {
    action: DraftAction,
    history: DraftAction[]
    currentAction: number
    index: number
}

export function TimelineEntry(props: TimelineEntryProps) {
    const {index, action, currentAction, history} = props
    const teamColorClass = action.team === DraftTeam.TEAM_A ? "teamA" : "teamB";
    const pastAction = index < currentAction;
    const colorClass = pastAction ? "" : teamColorClass;

    return (
        <Box key={index} sx={{display: "inline-block", m: 1, width: "65px", height: "65px"}}>
            <div style={{display: "inline", position: "relative"}}>
                {action.type === DraftActionType.PICK && !pastAction &&
                    <GroupAddIcon
                        className={colorClass}
                        sx={{position: "absolute", height: "60px", width: "60px", left: "-30px", top: "5px"}}/>
                }
                {action.type === DraftActionType.BAN && !pastAction &&
                    <GroupRemoveOutlinedIcon
                        className={colorClass}
                        sx={{position: "absolute", height: "60px", width: "60px", left: "-30px", top: "5px"}}/>
                }
                {history && history[index] &&
                    <img style={{
                        position: "absolute", left: "-30px", top: "5px",
                        width: "60px",
                        filter: (action.type === DraftActionType.BAN ? "grayscale(1)" : "")
                    }} src={`/classes/${history[index].breed}_0.png`}
                         alt={`Breed ${history[index].breed}`}/>
                }
                <Typography
                    className={teamColorClass}
                    sx={{position: "absolute", top: "60px", left: "-32px", fontWeight: "bold"}}>
                    {action.team === DraftTeam.TEAM_A ? "A " : "B "}
                </Typography>
                <Typography
                    className={teamColorClass}
                    sx={{position: "absolute", top: "60px", left: "-7px"}}
                >
                    <Trans sx={{display: "inline"}}
                           i18nKey={action.type === DraftActionType.PICK ? 'draft.pick' : 'draft.ban'}
                           components={{span: <span style={{fontWeight: "bold"}}/>}}/>
                </Typography>
            </div>
        </Box>
    )
}