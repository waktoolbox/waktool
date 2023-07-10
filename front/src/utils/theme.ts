import createTheme from "@mui/material/styles/createTheme";

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
                containedPrimary: {
                    backgroundColor: "rgb(74, 124, 177)",

                    "&.Mui-disabled": {
                        color: '#8299a1'
                    }
                },

                outlined: {
                    borderColor: '#00ead1 !important',
                    color: '#fefffa',
                    backgroundColor: '#213a41',
                    verticalAlign: "middle",
                    justifyContent: "center",

                    'svg': {
                        color: '#07c6b6',
                        paddingRight: 5
                    }
                }
            }
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1f333a',
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

        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: '#8299a1',

                    "&.Mui-focused": {
                        color: '#fefffa'
                    },
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
                root: {
                    borderColor: '#ff0000 !important',

                    ":invalid": {
                        backgroundColor: "red"
                    },

                    "legend": {
                        color: "red"
                    }
                },

                notchedOutline: {
                    borderColor: '#03c8be !important',
                }
            }
        },

        MuiSelect: {
            styleOverrides: {
                select: {
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
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    color: '#8299a1',

                    '&.Mui-focusVisible': {
                        backgroundColor: '#03c8be',
                    },

                    '&.Mui-selected': {
                        color: '#03c8be',
                        backgroundColor: '#0d1518',
                        borderTopLeftRadius: 5,
                        borderTopRightRadius: 5
                    },
                }
            }
        },

        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#03c8be'
                }
            }
        }
    }
})