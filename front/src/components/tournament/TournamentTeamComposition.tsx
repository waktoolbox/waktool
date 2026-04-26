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
    maxBannedBreeds?: number,
};

export default function TournamentTeamComposition(props: TournamentTeamCompositionParams) {
    const {
        team,
        breeds,
        setTeamValidateAndSetErrors,
        maxBreeds = 6,
        maxBannedBreeds = 0,
    } = props;

    const {t} = useTranslation();

    const hasPickedBreed = (breed: number) => team.breeds?.includes(breed);
    const isBannedBreed = (breed: number) => team.bannedBreeds?.includes(breed) ?? false;

    const imageHoverStyle = (breed: number) => {
        if (!team.breeds) return "";
        if (hasPickedBreed(breed)) return "imageHoverRed"
        if (team.breeds.length >= maxBreeds) return "imageHoverDisabled"
        return "imageHover"
    }

    const pickOrUnpickBreed = (breed: number) => {
        if (!hasPickedBreed(breed)) {
            if (team.breeds && team.breeds.length >= maxBreeds) return;

            // If picking a breed that was banned, remove it from bans
            const newBannedBreeds = isBannedBreed(breed)
                ? (team.bannedBreeds?.filter(b => b !== breed) ?? [])
                : (team.bannedBreeds ?? []);

            const t = {
                ...team,
                breeds: team.breeds ? [...team.breeds, breed] : [breed],
                bannedBreeds: newBannedBreeds.length > 0 ? newBannedBreeds : undefined,
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

    const isBanMaxReached = () => (team.bannedBreeds?.length ?? 0) >= maxBannedBreeds;

    const banImageStyle = (breed: number) => {
        if (hasPickedBreed(breed)) return "imageDisabled";
        if (isBannedBreed(breed)) return "imageBanned";
        if (isBanMaxReached()) return "imageDisabled";
        return "imageHover";
    }

    const banOrUnbanBreed = (breed: number) => {
        if (hasPickedBreed(breed)) return; // Cannot ban a picked breed

        const currentBans = team.bannedBreeds ?? [];

        if (isBannedBreed(breed)) {
            // Unban
            const newBannedBreeds = currentBans.filter(b => b !== breed);
            const t = {
                ...team,
                bannedBreeds: newBannedBreeds.length > 0 ? newBannedBreeds : undefined,
            };
            setTeamValidateAndSetErrors(t);
        } else {
            // Ban (respect max)
            if (currentBans.length >= maxBannedBreeds) return;
            const t = {
                ...team,
                bannedBreeds: [...currentBans, breed],
            };
            setTeamValidateAndSetErrors(t);
        }
    }

    return (
        <Grid item xs={12} sx={{p: 1}}>
            <Typography variant="h6">{t('tournament.team.composition')} ({team.breeds?.length ?? 0} / {maxBreeds})</Typography>
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
                                 onClick={() => pickOrUnpickBreed(breed)}/>
                        </div>
                    </Grid>
                ))}
            </Grid>

            {maxBannedBreeds > 0 && (
                <>
                    <Typography variant="h6" sx={{mt: 2}}>
                        {t('tournament.team.bannedBreeds')} ({team.bannedBreeds?.length ?? 0} / {maxBannedBreeds})
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
                                         className={`draftImage ${banImageStyle(breed)}`}
                                         onClick={() => banOrUnbanBreed(breed)}/>
                                    {isBannedBreed(breed) && (
                                        <BlockIcon sx={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: "6rem",
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