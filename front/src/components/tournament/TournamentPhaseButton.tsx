import {useTranslation} from "react-i18next";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import {RadioGroup} from "@mui/material";
import {useRecoilState} from "recoil";
import {tournamentPhasesState} from "../../atoms/atoms-tournament.ts";
import {ChangeEvent, useEffect, useState} from "react";
import {getPhases} from "../../services/tournament.ts";
import {useParams} from "react-router-dom";

type TournamentPhaseButtonProps = {
    onChange: (phase: number) => void
}

export default function TournamentPhaseButton(props: TournamentPhaseButtonProps) {
    const {id} = useParams();
    const [phases, setPhases] = useRecoilState(tournamentPhasesState)
    const [phase, setPhase] = useState(0)
    const {onChange} = props;
    const {t} = useTranslation();

    useEffect(() => {
        if (phases) return;

        getPhases(id || "").then((response) => {
            setPhases(response.maxPhase)
            setPhase(response.maxPhase)
        });
    }, [])

    function onRadioChange(newPhase: number) {
        onChange(newPhase);
        setPhase(newPhase);
    }

    return (
        <RadioGroup name="tournament-phase" value={phase} row sx={{ml: 4}}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => onRadioChange(parseInt((event.target as HTMLInputElement).value))}>
            {phases > 1 && [...Array(phases).keys()].map(p => (
                <FormControlLabel key={p + 1} value={p + 1}
                                  sx={{
                                      p: 1,
                                      borderRadius: 3,
                                      fontTransform: 'uppercase',
                                      backgroundColor: phase === p + 1 ? '#017d7f' : 'inherit',
                                      ':hover': {
                                          color: '#017d7f',
                                          backgroundColor: 'inherit'
                                      }
                                  }}
                                  control={<Radio sx={{display: "none"}}/>}
                                  label={t('tournament.phase', {phase: p + 1})}
                />
            ))}

        </RadioGroup>

    )

}