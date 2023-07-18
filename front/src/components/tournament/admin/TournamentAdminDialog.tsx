import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {ReactComponentElement, useState} from "react";

type TournamentAdminDialogProps = {
    component: ReactComponentElement<any> | undefined
}
export default function TournamentAdminDialog(props: TournamentAdminDialogProps) {
    const {component} = props
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                Open admin
            </Button>
            <Dialog onClose={() => setOpen(false)} open={open}>
                <DialogTitle>Tournament admin</DialogTitle>
                {component}
            </Dialog>
        </div>
    )
}