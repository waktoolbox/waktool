import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {ReactComponentElement, useState} from "react";

type TournamentAdminDialogProps = {
    buttonText: string
    title: string
    withTitle?: boolean
    children: ReactComponentElement<any> | undefined
}
export default function TournamentAdminDialog(props: TournamentAdminDialogProps) {
    const {buttonText, title, withTitle, children} = props
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                {buttonText}
            </Button>
            <Dialog onClose={() => setOpen(false)} open={open} maxWidth="md">
                <DialogTitle hidden={!withTitle}>{title}</DialogTitle>
                {children}
            </Dialog>
        </>
    )
}