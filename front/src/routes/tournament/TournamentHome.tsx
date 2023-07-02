import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import {Trans} from "react-i18next";
import {useEffect, useState} from "react";
import {gfetch} from "../../utils/fetch-utils.ts";
import TournamentCardView from "../../components/tournament/TournamentCardView";
import {LightTournament} from "../../chore/tournament.ts";

type TournamentHome = {
    featuredTournament?: LightTournament;
    tournaments?: LightTournament[];
    registration?: LightTournament[];
}
// TODO late : clean this code
export default function TournamentHome() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [home, setHome] = useState<TournamentHome>({})

    useEffect(() => {
        const fetch = async () => {
            setHome(await gfetch('/api/tournaments/home'));
        }
        fetch();
    }, [])

    window.addEventListener('resize', () => setWindowWidth(window.innerWidth))

    const homeParallax = {
        cra: {
            position: "relative",
            top: "16px",
            left: "-400px"
        },
        xelor: {
            position: "relative",
            top: "-70px",
            left: "160px",
        },
        portalTop: {
            position: "relative",
            top: "-310px",
            left: "-840px",
        },
        portalBottom: {
            position: "relative",
            top: "-170px",
            left: "-500px",
        }
    }

    return (
        <Grid container>
            <Grid container style={{height: "480px"}}>
                <div className="homeParallax" style={{
                    position: 'absolute',
                    left: 0,
                    width: "100%",
                    height: "480px",
                    overflow: "hidden",
                    backgroundColor: "#162834",
                    backgroundImage: `url("/home/home_parallax.jpg")`
                }}>
                    <img src="/home/xelor.png" style={homeParallax.xelor as React.CSSProperties} alt="Xelor"/>
                    <img src="/home/cra.png" style={homeParallax.cra as React.CSSProperties} alt="Cra"/>
                    <img src="/home/portal_top.png" style={homeParallax.portalTop as React.CSSProperties}
                         alt="Portal top"/>
                    <img src="/home/portal_bottom.png" style={homeParallax.portalBottom as React.CSSProperties}
                         alt="Portal bottom"/>

                    <Box sx={{
                        position: "absolute",
                        top: "150px",
                        left: `${windowWidth - 800}px`
                    } as React.CSSProperties}>
                        <Typography variant="h3" style={{
                            width: "600px",
                            wordWrap: "break-word",
                            textAlign: "left"
                        }}><b><Trans i18nKey="tournament.home.waktool"
                                     components={{span: <span className="blueWord"/>}}/></b></Typography>
                    </Box>
                </div>
            </Grid>

            <Grid container spacing={2} sx={{width: {xs: '100%', md: '80%'}, margin: 'auto'}}>
                <Grid item xl={4} xs={12} sx={{margin: 'auto', mb: 2}}>
                    <Typography sx={{mb: 2}} variant="h5">
                        <Trans i18nKey="tournament.home.featured.title"
                               components={{span: <span className="firstWord"/>}}/>
                    </Typography>
                    {home && home.featuredTournament && (
                        <TournamentCardView tournament={home.featuredTournament} width={400} height={500}
                                            logoHeight={350}/>
                    )}
                    {(!home || !home.featuredTournament) && (
                        <Card sx={{
                            mr: "auto",
                            ml: "auto",
                            height: '500px',
                            width: '400px',
                            borderRadius: "8px",
                            boxShadow: "5px 5px 15px -10px #000000"
                        }}/>
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
}