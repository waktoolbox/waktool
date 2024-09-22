import {accountCacheState} from "../../atoms/atoms-accounts.ts";
import {useRecoilState} from "recoil";
import Typography from "@mui/material/Typography";
import {ComponentProps} from "react";
import Tooltip from "@mui/material/Tooltip";

export function User(props: { userId: string, otherProps?: ComponentProps<typeof Typography> }) {
    const {userId, otherProps} = props;

    const [accounts] = useRecoilState(accountCacheState);

    const user = accounts.get(userId)

    return (
        <Tooltip title={user?.fullAnkamaName} placement="left" arrow>
            <Typography {...otherProps}>{user?.displayName || userId}</Typography>
        </Tooltip>
    )
}
