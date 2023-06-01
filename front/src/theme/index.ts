import {createTheme} from "@mui/material";

export default createTheme({
    palette: {
        background: {
            default: '#213a41'
        },
        text: {
            primary: '#fefffa',
            disabled: '#848889'
        }
    },

    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',].join(',')
    },

    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#213a41"
                }
            }
        },

        MuiButton: {
            styleOverrides: {
                outlined: {
                    borderColor: '#00ead1 !important',
                    color: '#fefffa',
                    backgroundColor: '#213a41',
                    verticalAlign: "middle",
                    paddingLeft: 8,
                    justifyContent: "center",

                    'svg': {
                        color: '#07c6b6',
                        paddingRight: 5
                    }
                }
            }
        },

        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#284e51'
                }
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0d1518'
                }
            }
        },

        MuiList: {
            styleOverrides: {
                root: {
                    padding: 0
                }
            }
        },

        MuiOutlinedInput: {
            styleOverrides: {
                notchedOutline: {
                    borderColor: '#03c8be !important',
                }
            }
        },

        MuiSelect: {
            styleOverrides: {
                select: {
                    padding: '8px 0px 0px 8px',
                    backgroundColor: '#172a30',
                    borderRadius: 4,
                    verticalAlign: 'middle',
                },

                icon: {
                    fill: "#325664 !important",
                },
            }
        },

        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#172a30",
                }
            }
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    backgroundColor: "#172a30",
                    justifyContent: "center",
                    verticalAlign: "middle",


                    "&.Mui-selected": {
                        backgroundColor: "#213a41",
                        "&.Mui-focusVisible": {background: "#213a41"}
                    },

                    ':hover': {
                        backgroundColor: "#213a41",
                        "&.Mui-focusVisible": {background: "#213a41"},
                        "&.Mui-selected": {background: "#213a41"}
                    },
                }
            },
        }
    }
})