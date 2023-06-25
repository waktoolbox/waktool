import {useTranslation} from "react-i18next";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select, {SelectProps} from "@mui/material/Select";
import {useState} from "react";

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

    return (
        <Select
            value={language}
            {...props}
        >
            {Object.keys(languages).map((lng) => (
                <MenuItem className="languagePicker"
                          key={lng}
                          onClick={() => {
                              i18n.changeLanguage(lng);
                              setLanguage(lng);
                          }}
                          value={lng}
                >
                    <Icon>
                        <img src={`/flags/${lng}.svg`} alt={`flag_${lng}`}/>
                    </Icon>
                </MenuItem>
            ))}
        </Select>
    );
}