import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";
import {LightTournament} from "../../chore/tournament";
import {useTranslation} from "react-i18next";

type TournamentViewProps = {
    tournament: LightTournament
    height: number
    width: number
    logoHeight: number,
    overriddenLink?: string,
    overriddenLevelAndServer?: number,
    overriddenLevelAndServerMt?: number
}

// TODO late : clean this code
export default function TournamentCardView(props: TournamentViewProps) {
    const {
        tournament,
        height,
        width,
        logoHeight,
        overriddenLink,
        overriddenLevelAndServer,
        overriddenLevelAndServerMt
    } = props;
    const {t} = useTranslation();
    return (
        <Link to={overriddenLink || `/tournament/${tournament.id}`}>
            <Card sx={{
                mr: "auto",
                ml: "auto",
                height: `${height}px`,
                width: `${width}px`,
                backgroundColor: "#152429",
                borderRadius: "8px",
                boxShadow: "5px 5px 15px -2px #000000"
            }}>
                <CardMedia component="img" height={logoHeight}
                           image={tournament.logo} sx={{zIndex: 1000}}/>
                <CardContent>
                    <Box sx={{
                        position: "relative",
                        ml: "auto",
                        mr: "auto",
                        mt: overriddenLevelAndServerMt || -5,
                        mb: 2,
                        zIndex: 1001,
                        borderRadius: 3,
                        backgroundColor: "#017d7f",
                        width: "fit-content",
                        height: `${overriddenLevelAndServer || "50"}px`,
                        pl: 2,
                        pr: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                    }}>
                        <Typography><b>{t('tournament.display.levelAndServer', {
                            level: tournament.level,
                            server: tournament.server
                        })}</b></Typography>
                    </Box>

                    <Typography sx={{textAlign: "left", ml: 2}} variant="h6"><b>{tournament.name}</b></Typography>
                    <Typography sx={{
                        textAlign: "left",
                        ml: 2
                    }}>{t('tournament.fromTo', {
                        from: new Date(Date.parse((tournament as any).startDate)),
                        to: new Date(Date.parse((tournament as any).endDate))
                    })}</Typography>
                </CardContent>
            </Card>
        </Link>
    )
}