import type { ThemeOptions } from '@mui/material/styles';

export const components: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollBehavior: 'smooth',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '::selection': {
        backgroundColor: 'rgba(103, 80, 164, 0.2)',
      },
    },
  },

  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: 100,
        padding: '10px 24px',
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.02)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #6750A4 0%, #7C5CBF 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #7C5CBF 0%, #8B6FCC 100%)',
        },
      },
      containedSecondary: {
        background: 'linear-gradient(135deg, #625B71 0%, #7A728A 100%)',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '14px 32px',
        fontSize: '1rem',
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      },
      sizeSmall: {
        borderRadius: 10,
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        borderRadius: 24,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[4],
        },
      }),
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: 24,
      },
    },
  },

  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          borderRadius: 16,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '& fieldset': {
            borderColor: theme.palette.divider,
            borderWidth: '1.5px',
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px',
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-error fieldset': {
            borderColor: theme.palette.error.main,
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
        '& .MuiFormHelperText-root': {
          marginLeft: 4,
          fontSize: '0.75rem',
        },
      }),
    },
  },

  MuiChip: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        fontWeight: 500,
        fontSize: '0.75rem',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'scale(1.04)',
        },
      }),
      filled: {
        border: '1px solid transparent',
      },
      outlined: {
        borderWidth: '1.5px',
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 28,
        padding: 8,
      },
    },
  },

  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 600,
        padding: '24px 24px 8px',
      },
    },
  },

  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '8px 24px 16px',
      },
    },
  },

  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '8px 24px 24px',
        gap: 8,
      },
    },
  },

  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 20,
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiTableCell-head': {
          backgroundColor: theme.palette.action.hover,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: theme.palette.text.secondary,
          borderBottom: `2px solid ${theme.palette.divider}`,
          padding: '12px 16px',
          whiteSpace: 'nowrap',
        },
      }),
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: 'rgba(103, 80, 164, 0.04)',
        },
        '&:last-child td': {
          borderBottom: 'none',
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '14px 16px',
        fontSize: '0.875rem',
        borderBottom: '1px solid',
        borderColor: 'divider',
      },
    },
  },

  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 48,
      },
      indicator: ({ theme }) => ({
        height: 3,
        borderRadius: '3px 3px 0 0',
        backgroundColor: theme.palette.primary.main,
      }),
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: 48,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        borderRadius: '12px 12px 0 0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: 'rgba(103, 80, 164, 0.04)',
        },
      },
      selected: {
        color: 'primary.main',
      },
    },
  },

  MuiAppBar: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: 'transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        border: 'none',
        backgroundColor: 'transparent',
        borderRight: `1px solid ${theme.palette.divider}`,
      }),
    },
  },

  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 52,
        height: 32,
        padding: 0,
      },
      switchBase: {
        padding: 4,
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          '& + .MuiSwitch-track': {
            opacity: 1,
          },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
          boxShadow: '0 0 0 8px rgba(103, 80, 164, 0.2)',
        },
      },
      thumb: {
        width: 24,
        height: 24,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
      },
      track: {
        borderRadius: 16,
        opacity: 1,
        backgroundColor: 'rgba(0,0,0,0.15)',
      },
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
      },
      rounded: {
        borderRadius: 16,
      },
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
    },
  },

  MuiBadge: {
    styleOverrides: {
      badge: {
        fontSize: '0.6875rem',
        fontWeight: 600,
        height: 20,
        minWidth: 20,
        padding: '0 6px',
        borderRadius: 10,
      },
      dot: {
        height: 10,
        minWidth: 10,
        borderRadius: 5,
      },
    },
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        alignItems: 'center',
      },
      standardSuccess: ({ theme }) => ({
        backgroundColor: theme.palette.success.main + '18',
        color: theme.palette.success.main,
        '& .MuiAlert-icon': { color: theme.palette.success.main },
      }),
      standardError: ({ theme }) => ({
        backgroundColor: theme.palette.error.main + '18',
        color: theme.palette.error.main,
        '& .MuiAlert-icon': { color: theme.palette.error.main },
      }),
      standardWarning: ({ theme }) => ({
        backgroundColor: theme.palette.warning.main + '18',
        color: theme.palette.warning.main,
        '& .MuiAlert-icon': { color: theme.palette.warning.main },
      }),
      standardInfo: ({ theme }) => ({
        backgroundColor: theme.palette.info.main + '18',
        color: theme.palette.info.main,
        '& .MuiAlert-icon': { color: theme.palette.info.main },
      }),
    },
  },

  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiAlert-root': {
          borderRadius: 16,
        },
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      outlined: {
        borderRadius: 16,
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        margin: '2px 6px',
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: 'rgba(103, 80, 164, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(103, 80, 164, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.16)',
          },
        },
      },
    },
  },

  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        height: 6,
        backgroundColor: 'rgba(103, 80, 164, 0.12)',
      },
      bar: {
        borderRadius: 8,
      },
    },
  },

  MuiSkeleton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      rounded: {
        borderRadius: 16,
      },
    },
  },

  MuiBackdrop: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      },
    },
  },

  MuiInputBase: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-notchedOutline': {
          borderRadius: 16,
        },
      },
    },
  },

  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        marginTop: 4,
        boxShadow: '0px 8px 32px rgba(0,0,0,0.12)',
      },
      listbox: {
        padding: 8,
        '& .MuiAutocomplete-option': {
          borderRadius: 12,
          margin: '2px 0',
          '&.Mui-focused': {
            backgroundColor: 'rgba(103, 80, 164, 0.08)',
          },
        },
      },
    },
  },
};