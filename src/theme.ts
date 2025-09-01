// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#36746F',
            dark: '#2f625d',
            contrastText: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Sarabun", "Helvetica Neue", Arial, sans-serif',
    },
    components: {
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    minWidth: 36,
                    height: 36,
                    marginLeft: 4,
                    marginRight: 4,
                    backgroundColor: '#ffffff',
                    border: '1px solid #E0E3E7',
                    color: '#424242',
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                columnHeaders: {
                    backgroundColor: '#36746F',
                    color: 'white',
                    fontWeight: 'bold',
                },
                columnHeader: {
                    backgroundColor: '#36746F',
                },
                root: {
                    border: 'none', // Removes the main outer border
                    // Alternating row colors
                    '& .MuiDataGrid-row:nth-of-type(odd)': {
                        backgroundColor: '#FFFFFF',
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: '#e7e8e9',
                    },
                },
                // cell: {
                //     borderBottom: 'none', // Removes the horizontal lines between rows
                // },
                // columnSeparator: {
                //     display: 'none', // Hides the vertical lines between headers
                // },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: 'white',
                    '&.Mui-disabled': {
                        backgroundColor: 'rgba(0, 0, 0, 0.12)', // Standard MUI disabled gray

                    },

                },
            },
        },

        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                fullWidth: true,
                size: 'small',
                InputLabelProps: {
                    shrink: true,
                },
            },

        },

        MuiSelect: {
            defaultProps: {
                variant: 'outlined',
                fullWidth: true,
                size: 'small',
            },
        },

        MuiDateTimePicker: {
            defaultProps: {
                slotProps: {
                    textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: {
                            '& .MuiPickersOutlinedInput-root.Mui-disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            },

                        },
                    },

                },
            },

        },
        MuiDatePicker: {
            defaultProps: {
                slotProps: {
                    textField: {
                        size: 'small',
                        fullWidth: true,
                        sx: {
                            '& .MuiPickersOutlinedInput-root.Mui-disabled': {
                                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            },

                        },
                    },
                },
            },

        },
        MuiInputLabel: {
            styleOverrides: {
                // Target the asterisk pseudo-element
                asterisk: {
                    color: '#d32f2f', // This is MUI's default error/red color
                },
                root: {
                    fontSize: '18px',
                }
            },
        },
    },
});

export default theme;
