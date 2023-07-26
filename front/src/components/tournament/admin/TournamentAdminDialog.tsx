import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {ReactComponentElement, useState} from "react";

type TournamentAdminDialogProps = {
    buttonText: string
    title: string
    children: ReactComponentElement<any> | undefined
}
export default function TournamentAdminDialog(props: TournamentAdminDialogProps) {
    const {buttonText, title, children} = props
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                {buttonText}
            </Button>
            <Dialog onClose={() => setOpen(false)} open={open}>
                <DialogTitle>{title}</DialogTitle>
                {children}
            </Dialog>
        </div>
    )
}