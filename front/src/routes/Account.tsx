import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {Trans, useTranslation} from "react-i18next";
import {Form, useActionData, useLoaderData} from 'react-router-dom'
import {Account as AccountModel} from "../services/account.ts";
import {useEffect, useState} from "react";
import {useSetRecoilState} from "recoil";
import {loginStateUpdater} from "../atoms/atoms-header.ts";
import {snackState} from "../atoms/atoms-snackbar.ts";

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
    const setSnackValue = useSetRecoilState(snackState);

    const [ankamaName, setAnkamaName] = useState(account.ankamaName || "");
    const [ankamaDiscriminator, setAnkamaDiscriminator] = useState(account.ankamaDiscriminator || "");
    const [twitchUrl, setTwitchUrl] = useState(account.twitchUrl || "");
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        if (!actionData) return;

        setLoginStateUpdater(1);
        setHasChanged(false)
        setSnackValue({
            severity: "success",
            message: t('saved') as string,
            open: true
        })
    }, [actionData])


    const items: FormItem[] = [
        {
            xs: 12, md: 8, sx: {p: 2},
            fieldName: "ankamaName", labelKey: "account.ankamaName",
            value: ankamaName, setter: setAnkamaName, required: true,
            error: !ankamaName || ankamaName.length <= 0 || !ankamaName.match(/^[0-9a-zA-Z-]{3,29}$/),
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
            error: twitchUrl !== undefined && twitchUrl !== null && twitchUrl !== "" && !twitchUrl.match(/^(https:\/\/)((www|en-es|en-gb|secure|beta|ro|www-origin|en-ca|fr-ca|lt|zh-tw|he|id|ca|mk|lv|ma|tl|hi|ar|bg|vi|th)\.)?twitch\.tv\/(?!directory|p|user\/legal|admin|login|signup|jobs)([\w+]{4,25})$/),
            helperText: (error) => error ? 'error.twitchUrl' : undefined
        }
    ];

    return (
        <Grid container>
            <Grid item xs={12} className="screenWideTitle" sx={{
                backgroundColor: '#162834',
                width: '100%',
                height: '150px',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                zIndex: 1
            }}>
                <Typography variant="h4">
                    <Trans i18nKey="account.title" components={{span: <span className="blueWord"/>}}/>
                </Typography>
            </Grid>

            <Grid item xs={12} md={8} sx={{width: {xs: '100%', md: '80%'}, margin: 'auto', pt: 3}}>
                <Form method="post">
                    <input type="hidden" name="id" value={account.id}/>
                    <Grid container>
                        {items.map((item: FormItem) => (
                            <Grid key={item.fieldName} item xs={item.xs} md={item.md} sx={item.sx}>
                                <TextField sx={{width: "100%"}} id={item.fieldName} name={item.fieldName}
                                           label={t(item.labelKey)}
                                           value={item.value}
                                           onChange={e => {
                                               item.setter(e.target.value)
                                               setHasChanged(true)
                                           }}
                                           type={item.type} required={item.required}
                                           error={item.error} autoComplete='off'
                                           helperText={item.helperText ? [item.helperText(item.error || false)].map(e => e ? t(e) : undefined) : undefined}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12} sx={{p: 2, pt: 1}}>
                            <Button variant="contained" disabled={!hasChanged || items.find(i => i.error) !== undefined}
                                    type="submit"
                                    sx={{width: "100%"}}>{t('save')}</Button>
                        </Grid>
                    </Grid>
                </Form>
            </Grid>
        </Grid>
    );
}