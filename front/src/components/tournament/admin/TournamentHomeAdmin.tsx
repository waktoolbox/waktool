import Button from "@mui/material/Button";
import {useParams} from "react-router-dom";
import {postGoToNextPhase} from "../../../services/tournament.ts";
import {useState} from "react";

export default function TournamentHomeAdmin() {
    const {id} = useParams();
    const [locked, setLocked] = useState(false);

    function goToNextPhase() {
        postGoToNextPhase(id ?? "").then(() => setLocked(false))
    }

    return (
        <div>
            <Button disabled={locked} onClick={goToNextPhase}>Go to next phase</Button>
        </div>
    )
}