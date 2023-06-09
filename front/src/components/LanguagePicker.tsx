import {useTranslation} from "react-i18next";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select, {SelectProps} from "@mui/material/Select";
import {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {languageState} from "../atoms/atoms-header.ts";

interface Language {
    nativeName: string;
}

const languages: { [key: string]: Language } = {
    en: {nativeName: 'English'},
    fr: {nativeName: 'Français'},
}

export default function LanguagePicker(props: SelectProps) {
    const {i18n} = useTranslation();
    const resolvedLanguage = i18n.resolvedLanguage || "en";
    const [language, setLanguage] = useState(resolvedLanguage)
    const [_, setRecoilLanguage] = useRecoilState(languageState);

    useEffect(() => {
        setRecoilLanguage(resolvedLanguage);
    }, [])

    return (
        <Select sx={{height: '100%'}}
                value={language}
                {...props}
        >
            {Object.keys(languages).map((lng) => (
                <MenuItem className="languagePicker"
                          key={lng}
                          onClick={() => {
                              i18n.changeLanguage(lng);
                              setLanguage(lng);
                              setRecoilLanguage(lng);
                          }}
                          value={lng}
                >
                    <Icon sx={{margin: 'auto', verticalAlign: 'middle'}}>
                        <img width={24} height={18} src={`/flags/${lng}.svg`} alt={`flag_${lng}`}/>
                    </Icon>
                </MenuItem>
            ))}
        </Select>
    );
}