import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {SyntheticEvent} from "react";
import {useRecoilState} from "recoil";
import {snackState} from "../atoms/atoms-snackbar.ts";

export default function MySnackbar() {
    const [snack, setSnack] = useRecoilState(snackState)

    const handleClose = (_: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;

        setSnack({
            ...snack,
            open: false
        });
    };

    return (
        <div>
            <Snackbar
                open={snack.open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{vertical: "top", horizontal: "right"}}
            >
                <Alert severity={snack.severity} onClose={handleClose}>{snack.message}</Alert>
            </Snackbar>
        </div>
    );
}