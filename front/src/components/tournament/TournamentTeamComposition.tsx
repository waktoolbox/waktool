import {TournamentTeamModel} from "../../chore/tournament.ts";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {BreedsArray} from "../../chore/breeds.ts";
import {useTranslation} from "react-i18next";
import BlockIcon from '@mui/icons-material/Block';

type TournamentTeamCompositionParams = {
    team: Partial<TournamentTeamModel>,
    breeds: number[],
    setTeamValidateAndSetErrors: (team: Partial<TournamentTeamModel>) => void,
    maxBreeds?: number,
    requireBannedBreed?: boolean,
};

export default function TournamentTeamComposition(props: TournamentTeamCompositionParams) {
    const {
        team,
        breeds,
        setTeamValidateAndSetErrors,
        maxBreeds = 6,
        requireBannedBreed = false,
    } = props;

    const {t} = useTranslation();

    const hasPickedBreed = (breed: number) => team.breeds?.includes(breed);
    const isBannedBreed = (breed: number) => team.bannedBreed === breed;

    const imageHoverStyle = (breed: number) => {
        if (!team.breeds) return "";
        if (hasPickedBreed(breed)) return "imageHoverRed"
        if (team.breeds.length >= maxBreeds) return "imageHoverDisabled"
        return "imageHover"
    }

    const pickOrUnpickBreed = (breed: number) => {
        if (!hasPickedBreed(breed)) {
            if (team.breeds && team.breeds.length >= maxBreeds) return;

            // If picking a breed that was the banned one, clear the ban
            const newBannedBreed = isBannedBreed(breed) ? undefined : team.bannedBreed;

            const t = {
                ...team,
                breeds: team.breeds ? [...team.breeds, breed] : [breed],
                bannedBreed: newBannedBreed,
            };
            setTeamValidateAndSetErrors(t);
            return;
        }

        const t = {
            ...team,
            breeds: team.breeds ? team.breeds.filter(b => b !== breed) : []
        };
        setTeamValidateAndSetErrors(t);
    }

    const banOrUnbanBreed = (breed: number) => {
        if (hasPickedBreed(breed)) return; // Cannot ban a picked breed

        const newBannedBreed = isBannedBreed(breed) ? undefined : breed;
        const t = {
            ...team,
            bannedBreed: newBannedBreed,
        };
        setTeamValidateAndSetErrors(t);
    }

    return (
        <Grid item xs={12} sx={{p: 1}}>
            <Typography variant="h6">{t('tournament.team.composition')}</Typography>
            <Grid container>
                {BreedsArray.map(breed => (
                    <Grid item key={breed} xs={2}>
                        <div style={{position: "relative", display: "inline-block", width: "95%"}}>
                            <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                                 style={{width: "100%", display: "inline", borderRadius: 15}}
                                 className={`draftImage
                                             ${breeds && breeds.length >= maxBreeds && breeds.filter(b => b === breed).length <= 0 ? "imageDisabled" : ""}  
                                             ${hasPickedBreed(breed) ? "imagePicked" : ""}
                                             ${imageHoverStyle(breed)}
                                             `}
                                 onClick={() => {
                                     pickOrUnpickBreed(breed)
                                 }}/>
                        </div>
                    </Grid>
                ))}
            </Grid>

            {requireBannedBreed && (
                <>
                    <Typography variant="h6" sx={{mt: 2}}>
                        {t('tournament.team.bannedBreed')}
                    </Typography>
                    <Grid container>
                        {BreedsArray.map(breed => (
                            <Grid item key={breed} xs={2}>
                                <div style={{position: "relative", display: "inline-block", width: "95%"}}>
                                    <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                                         style={{
                                             width: "100%",
                                             display: "inline",
                                             borderRadius: 15,
                                             opacity: hasPickedBreed(breed) ? 0.2 : 1,
                                         }}
                                         className={`draftImage
                                                     ${hasPickedBreed(breed) ? "imageDisabled" : ""}
                                                     ${isBannedBreed(breed) ? "imageBanned" : ""}
                                                     ${!hasPickedBreed(breed) && !isBannedBreed(breed) ? "imageHover" : ""}
                                                     `}
                                         onClick={() => {
                                             banOrUnbanBreed(breed)
                                         }}/>
                                    {isBannedBreed(breed) && (
                                        <BlockIcon sx={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: "2.5rem",
                                            color: "#e64b4b",
                                            pointerEvents: "none",
                                        }}/>
                                    )}
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Grid>
    )
}