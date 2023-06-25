import {useNavigate, useParams} from "react-router-dom";
import Grid from "@mui/material/Grid";
import DraftConfigurator from "../components/draft/DraftConfigurator.tsx";
import DraftViewer from "../components/draft/DraftViewer.tsx";
import {useEffect} from "react";
import {send, subscribe, unsubscribe} from "../utils/socket.ts";
import {DraftData} from "../chore/draft.ts";
import {useRecoilState} from "recoil";
import {draftDataState} from "../atoms/atoms-draft.ts";

export default function Draft() {
    const navigate = useNavigate();
    const {draftId} = useParams();
    const [draftData, setDraftData] = useRecoilState(draftDataState);

    useEffect(() => {
        subscribe("draft::data", (data: DraftData) => {
            if (!data) {
                navigate("/draft")
                return;
            }
            setDraftData(data);
        });

        subscribe("draft", (response: { id: string }) => {
            navigate("/draft/" + response.id)
        });

        if (draftId) {
            send("draft::get", {id: draftId});
        }

        return () => {
            unsubscribe("draft")
            unsubscribe("draft::data");
        }
    }, [draftId]);

    return (
        <Grid container direction="row" sx={{pt: 4, pb: 4, margin: "auto"}}>
            {(!draftData || !draftData.id) && <DraftConfigurator/>}
            {draftId && <DraftViewer/>}
        </Grid>
    );
}