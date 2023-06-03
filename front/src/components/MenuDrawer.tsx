import {Box, Divider, List, ListItem, ListItemText, Stack, SwipeableDrawer,} from "@mui/material";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useRecoilState} from "recoil";
import {menuDrawerState} from "../atoms/atoms-header.ts";

type Items = {
    key: string,
    translationKey: string,
    link?: string
}

type Category = {
    key: string,
    translationKey: string
    items: Items[]
}

const categories: Category[] = [
    {
        key: "account",
        translationKey: "menu.account",
        items: [
            {
                key: "account.profile",
                translationKey: "menu.profile.link",
                link: "/account"
            }
        ]
    },

    {
        key: "tools",
        translationKey: "menu.tools",
        items: [
            {
                key: "tools.draft",
                translationKey: "menu.draft.link",
                link: "/draft"
            }
        ]
    }
]

function MenuDrawer() {
    const {t} = useTranslation();
    const [drawerState, setDrawerState] = useRecoilState(menuDrawerState);

    return (
        <SwipeableDrawer
            anchor="left"
            open={drawerState}
            onClose={() => setDrawerState(false)}
            onOpen={() => setDrawerState(true)}
        >
            <Box
                sx={{width: 250}}
                role="presentation"
                onClick={() => setDrawerState(false)}
                onKeyDown={() => setDrawerState(false)}
            >
                <img style={{padding: "40px 20px 5px 30px"}} src={`/logo.png`} alt={'logo'}/>
                <Divider sx={{ml: '30px', mr: '60px', mb: '50px'}} variant="middle" flexItem/>
                <List>
                    {categories && categories.map((category) => (
                        <ListItem key={category.key}>
                            <Stack>
                                <ListItemText primary={t(category.translationKey)}/>
                                <List>
                                    {category.items && category.items.map((item) => (
                                        <ListItem key={item.key} sx={{color: '#9da5a8', '&:hover': {color: '#10e9d6'}}}>
                                            {item.link && (
                                                <Link to={item.link}>
                                                    {t(item.translationKey)}
                                                </Link>
                                            )}
                                            {!item.link && <ListItemText primary={t(item.translationKey)}/>}
                                        </ListItem>
                                    ))}
                                </List>
                            </Stack>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </SwipeableDrawer>
    )
}

export default MenuDrawer;