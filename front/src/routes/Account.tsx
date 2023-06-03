import {Button, Grid, TextField, Typography} from "@mui/material";
import {Trans, useTranslation} from "react-i18next";
import {Form, useActionData, useLoaderData} from 'react-router-dom'
import {Account as AccountModel} from "../services/account.ts";
import {useState} from "react";
import {useSetRecoilState} from "recoil";
import {loginStateUpdater} from "../atoms/atoms-header.ts";

type FormItem = {
    xs?: number,
    md?: number,
    sx?: any
    fieldName: string,
    labelKey: string,
    value: any,
    setter: any,
    type?: string
    required?: boolean
    error?: boolean
    helperText?: (error: boolean) => string | undefined
}

export default function Account() {
    const {t} = useTranslation();
    const account = useLoaderData() as AccountModel;
    const actionData = useActionData();
    const setLoginStateUpdater = useSetRecoilState(loginStateUpdater);

    if (actionData) {
        setLoginStateUpdater(1);
    }

    const [ankamaName, setAnkamaName] = useState(account.ankamaName || "");
    const [ankamaDiscriminator, setAnkamaDiscriminator] = useState(account.ankamaDiscriminator || "");
    const [twitchUrl, setTwitchUrl] = useState(account.twitchUrl || "");

    const items: FormItem[] = [
        {
            xs: 12, md: 8, sx: {p: 2},
            fieldName: "ankamaName", labelKey: "account.ankamaName",
            value: ankamaName, setter: setAnkamaName, required: true,
            error: !ankamaName || ankamaName.length <= 0,
            helperText: (error) => error ? 'error.ankamaName' : undefined
        },
        {
            xs: 12, md: 4, sx: {p: 2},
            fieldName: "ankamaDiscriminator", labelKey: "account.ankamaDiscriminator",
            value: ankamaDiscriminator, setter: setAnkamaDiscriminator, required: true, type: "number",
            error: !ankamaDiscriminator || ankamaDiscriminator.length <= 0 || isNaN(+ankamaDiscriminator) || +ankamaDiscriminator <= 0 || +ankamaDiscriminator > 9999,
            helperText: (error) => error ? 'error.ankamaDiscriminator' : undefined
        },
        {
            xs: 12, sx: {p: 2},
            fieldName: "twitchUrl", labelKey: "account.twitchUrl",
            value: twitchUrl, setter: setTwitchUrl,
            // error: twitchUrl !== undefined && !twitchUrl.match(/^(https?:\/\/)?(www\.)?twitch\.tv\/[a-zA-Z0-9_]{4,25}$/),
            error: twitchUrl !== undefined && !twitchUrl.match(/^(https:\/\/)((www|en-es|en-gb|secure|beta|ro|www-origin|en-ca|fr-ca|lt|zh-tw|he|id|ca|mk|lv|ma|tl|hi|ar|bg|vi|th)\.)?twitch\.tv\/(?!directory|p|user\/legal|admin|login|signup|jobs)([\w+]{4,25})$/),
            helperText: (error) => error ? 'error.twitchUrl' : undefined
        }
    ];

    return (
        <Grid container>
            <Grid item xs={12} sx={{
                backgroundColor: '#162834',
                height: '150px',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase"
            }}>
                <Typography variant="h4">
                    <Trans i18nKey="account.title" components={{span: <span className="blueWord"/>}}/>
                </Typography>
            </Grid>

            <Grid item xs={12} md={8} sx={{margin: "auto", pt: 3}}>
                <Form method="post">
                    <input type="hidden" name="id" value={account.id}/>
                    <Grid container>
                        {items.map((item: FormItem) => (
                            <Grid key={item.fieldName} item xs={item.xs} md={item.md} sx={item.sx}>
                                <TextField sx={{width: "100%"}} id={item.fieldName} name={item.fieldName}
                                           label={t(item.labelKey)}
                                           value={item.value} onChange={e => item.setter(e.target.value)}
                                           type={item.type} required={item.required}
                                           error={item.error}
                                           helperText={item.helperText ? [item.helperText(item.error || false)].map(e => e ? t(e) : undefined) : undefined}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12} sx={{p: 2, pt: 1}}>
                            <Button type="submit" sx={{width: "100%"}}>{t('save')}</Button>
                        </Grid>
                    </Grid>
                </Form>
            </Grid>
        </Grid>
    );
}