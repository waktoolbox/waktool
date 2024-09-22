import {TournamentTeamModel} from "../../chore/tournament.ts";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {BreedsArray} from "../../chore/breeds.ts";
import {useTranslation} from "react-i18next";

type TournamentTeamCompositionParams = {
    team: Partial<TournamentTeamModel>,
    breeds: number[],
    setTeamValidateAndSetErrors: (team: Partial<TournamentTeamModel>) => void,
};

export default function TournamentTeamComposition(props: TournamentTeamCompositionParams) {
    const {
        team,
        breeds,
        setTeamValidateAndSetErrors
    } = props;

    const {t} = useTranslation();

    const hasPickedBreed = (breed: number) => team.breeds?.includes(breed);

    const imageHoverStyle = (breed: number) => {
        if (!team.breeds) return "";
        if (hasPickedBreed(breed)) return "imageHoverRed"
        if (team.breeds.length >= 6) return "imageHoverDisabled"
        return "imageHover"
    }

    const pickOrUnpickBreed = (breed: number) => {
        if (!hasPickedBreed(breed)) {
            if (team.breeds && team.breeds.length >= 6) return;

            const t = {
                ...team,
                breeds: team.breeds ? [...team.breeds, breed] : [breed]
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

    return (
        <Grid item xs={12} sx={{p: 1}}>
            <Typography variant="h6">{t('tournament.team.composition')}</Typography>
            <Grid container>
                {BreedsArray.map(breed => (
                    <Grid item key={breed} xs={2}>
                        <img src={`/classes/${breed}_0.png`} alt={`Breed ${breed}`}
                             style={{width: "95%", display: "inline", borderRadius: 15}}
                             className={`draftImage
                                             ${breeds && breeds.length >= 6 && breeds.filter(b => b === breed).length <= 0 ? "imageDisabled" : ""}  
                                             ${hasPickedBreed(breed) ? "imagePicked" : ""}
                                             ${imageHoverStyle(breed)}
                                             `}

                             onClick={() => {
                                 pickOrUnpickBreed(breed)
                             }}/>
                    </Grid>
                ))}
            </Grid>
        </Grid>
    )
}