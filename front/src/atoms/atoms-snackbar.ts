import {atom} from "recoil";
import {AlertColor} from "@mui/material";

export type SnackMessage = {
    severity?: AlertColor,
    message?: string
    open: boolean
}

export const snackState = atom<SnackMessage>({
    key: "snack",
    default: {
        severity: undefined,
        message: undefined,
        open: false
    }
})