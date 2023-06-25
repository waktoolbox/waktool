import {DraftAction, DraftTeam, DraftUser} from "../../chore/draft.ts";
import {useEffect, useState} from "react";
import {subscribe} from "../../utils/socket.ts";
import {useRecoilValue} from "recoil";
import {draftDataState} from "../../atoms/atoms-draft.ts";
import {useParams} from "react-router-dom";

type DraftUserAssigned = {
    user: DraftUser,
    team: DraftTeam
}

type DraftTeamReady = {
    team: DraftTeam
    ready: boolean
}

type DraftNotification = {
    type: string,
    data: DraftUser | DraftAction | DraftUserAssigned | DraftTeamReady
}

function DraftViewer() {
    const {draftId} = useParams();
    const draftData = useRecoilValue(draftDataState);

    const [currentAction, setCurrentAction] = useState(draftData?.currentAction || 0)

    useEffect(() => {
        subscribe("draft-" + draftId, (draftNotification: DraftNotification) => {
            switch (draftNotification.type) {
                case "draft::userJoined": {
                    console.log(draftNotification)
                    // TODO DraftUser
                    break;
                }
                case "draft::userAssigned": {
                    console.log(draftNotification)
                    // TODO DraftUserAssigned
                    break;
                }
                case "draft::action": {
                    console.log(draftNotification)
                    // TODO DraftUserAssigned
                    break;
                }
                case "draft::teamReady": {
                    console.log(draftNotification)
                    // TODO DraftTeamReady
                    break;
                }
            }
        });
    }, [draftId])

    return (
        <>
            {JSON.stringify(draftData)}
        </>
    )
}

export default DraftViewer;