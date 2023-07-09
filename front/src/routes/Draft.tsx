import {useNavigate, useParams} from "react-router-dom";
import Grid from "@mui/material/Grid";
import DraftConfigurator from "../components/draft/DraftConfigurator.tsx";
import DraftViewer from "../components/draft/DraftViewer.tsx";
import {useEffect} from "react";
import {send, subscribe, unsubscribe} from "../utils/socket.ts";
import {DraftData} from "../chore/draft.ts";
import {useRecoilState} from "recoil";
import {draftDataState} from "../atoms/atoms-draft.ts";
import {socketWhoAmIState} from "../atoms/atoms-socket.ts";

export default function Draft() {
    const navigate = useNavigate();
    const {draftId} = useParams();
    const [draftData, setDraftData] = useRecoilState(draftDataState);
    const [whoAmI, setWhoAmI] = useRecoilState(socketWhoAmIState);

    useEffect(() => {
        subscribe("whoami", (response: { id: string }) => {
            setWhoAmI(response.id)
            unsubscribe("whoami")
        });

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

        if (!whoAmI) {
            send("whoami", {});
        }

        if (draftId) {
            send("draft::get", {id: draftId});
        }

        return () => {
            unsubscribe("draft")
            unsubscribe("draft::data");
        }
    }, [draftId]);

    return (
        <Grid container direction="row" sx={{width: {xs: '100%', md: '80%'}, pt: 4, pb: 4, margin: "auto"}}>
            {(!draftData || !draftData.id) && <DraftConfigurator/>}
            {draftData && draftData.id && <DraftViewer/>}
        </Grid>
    );
}