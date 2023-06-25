import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import {useTranslation} from "react-i18next";

function Footer() {
    const {t} = useTranslation();

    return (
        <footer style={{backgroundColor: "#0d1518"}}>
            <img style={{marginTop: 16}} src="/logo.png" alt="logo"/>
            <Divider sx={{width: "166px", bgcolor: "rgba(132,136,137,0.3)", margin: "8px auto 8px auto !important"}}
                     variant="middle"/>
            <Typography sx={{color: "#368488", fontSize: '0.8rem'}}>{t('footer.wakfu')}</Typography>
            <Typography sx={{mb: '16px', fontSize: '0.8rem'}}>{t('footer.login')}</Typography>
        </footer>
    )
}

export default Footer;