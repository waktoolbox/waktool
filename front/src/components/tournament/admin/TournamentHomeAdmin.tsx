import Button from "@mui/material/Button";
import {useParams} from "react-router-dom";
import {postGoToNextPhase, postRecomputeStats} from "../../../services/tournament.ts";
import {useState} from "react";

export default function TournamentHomeAdmin() {
    const {id} = useParams();
    const [locked, setLocked] = useState(false);

    function goToNextPhase() {
        postGoToNextPhase(id ?? "").then(() => setLocked(false))
    }

    function recomputeStats() {
        postRecomputeStats(id ?? "").then(() => setLocked(false))
    }

    return (
        <div>
            <Button variant="contained" color="error" disabled={locked} onClick={goToNextPhase} sx={{m: 1}}>Go to next
                phase</Button>
            <Button variant="contained" color="warning" disabled={locked} onClick={recomputeStats} sx={{m: 1}}>Recompute
                stats</Button>
        </div>
    )
}