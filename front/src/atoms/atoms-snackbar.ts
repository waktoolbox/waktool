import {atom} from "@zedux/react";
import {AlertColor} from "@mui/material/Alert";

export type SnackMessage = {
    severity?: AlertColor,
    message?: string
    open: boolean
}

export const snackState = atom<SnackMessage>(
    "snack",
    {
        severity: undefined,
        message: undefined,
        open: false
    }
)