import React from "react";
import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from "@mui/material/styles";
import { EventEmitter } from "../../utils/EventEmitter";
import { Settings } from "../../Settings/Settings";

export const ThemeEvents = new EventEmitter<[]>();

declare module "@mui/material/styles" {
  interface Theme {
    colors: {
      hp: React.CSSProperties["color"];
      money: React.CSSProperties["color"];
      hack: React.CSSProperties["color"];
      combat: React.CSSProperties["color"];
      cha: React.CSSProperties["color"];
      int: React.CSSProperties["color"];
      rep: React.CSSProperties["color"];
      backgroundsecondary: React.CSSProperties["color"];
      button: React.CSSProperties["color"];
      white: React.CSSProperties["color"];
      black: React.CSSProperties["color"];
      maplocation: React.CSSProperties["color"];
      welllight: React.CSSProperties["color"];
      bnlvl0: React.CSSProperties["color"];
      bnlvl1: React.CSSProperties["color"];
      bnlvl2: React.CSSProperties["color"];
      bnlvl3: React.CSSProperties["color"];
    };
  }
  interface ThemeOptions {
    colors: {
      hp: React.CSSProperties["color"];
      money: React.CSSProperties["color"];
      hack: React.CSSProperties["color"];
      combat: React.CSSProperties["color"];
      cha: React.CSSProperties["color"];
      int: React.CSSProperties["color"];
      rep: React.CSSProperties["color"];
      backgroundsecondary: React.CSSProperties["color"];
      button: React.CSSProperties["color"];
      white: React.CSSProperties["color"];
      black: React.CSSProperties["color"];
      maplocation: React.CSSProperties["color"];
      welllight: React.CSSProperties["color"];
      bnlvl0: React.CSSProperties["color"];
      bnlvl1: React.CSSProperties["color"];
      bnlvl2: React.CSSProperties["color"];
      bnlvl3: React.CSSProperties["color"];
    };
  }
}

let theme: Theme;
const themeStyleSheet = new CSSStyleSheet();

export function refreshTheme(): void {
  theme = createTheme({
    colors: {
      hp: Settings.theme.hp,
      money: Settings.theme.money,
      hack: Settings.theme.hack,
      combat: Settings.theme.combat,
      cha: Settings.theme.cha,
      int: Settings.theme.int,
      rep: Settings.theme.rep,
      backgroundsecondary: Settings.theme.backgroundsecondary,
      button: Settings.theme.button,
      white: Settings.theme.white,
      black: Settings.theme.black,
      maplocation: Settings.theme.maplocation,
      welllight: Settings.theme.welllight,
      bnlvl0: Settings.theme.bnlvl0,
      bnlvl1: Settings.theme.bnlvl1,
      bnlvl2: Settings.theme.bnlvl2,
      bnlvl3: Settings.theme.bnlvl3,
    },
    palette: {
      primary: {
        light: Settings.theme.primarylight,
        main: Settings.theme.primary,
        dark: Settings.theme.primarydark,
      },
      secondary: {
        light: Settings.theme.secondarylight,
        main: Settings.theme.secondary,
        dark: Settings.theme.secondarydark,
      },
      error: {
        light: Settings.theme.errorlight,
        main: Settings.theme.error,
        dark: Settings.theme.errordark,
      },
      info: {
        light: Settings.theme.infolight,
        main: Settings.theme.info,
        dark: Settings.theme.infodark,
      },
      warning: {
        light: Settings.theme.warninglight,
        main: Settings.theme.warning,
        dark: Settings.theme.warningdark,
      },
      success: {
        light: Settings.theme.successlight,
        main: Settings.theme.success,
        dark: Settings.theme.successdark,
      },
      background: {
        default: Settings.theme.backgroundprimary,
        paper: Settings.theme.well,
      },
      action: {
        disabled: Settings.theme.disabled,
      },
    },
    typography: {
      fontFamily: Settings.styles.fontFamily,
      fontSize: Settings.styles.fontSize,
      button: {
        textTransform: "none",
      },
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main,
          },
          input: {
            "&::placeholder": {
              userSelect: "none",
              color: theme.palette.primary.dark,
            },
          },
        },
      },

      MuiInput: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.paper,
            borderBottomColor: theme.colors.white,
          },
          underline: {
            "&:hover": {
              borderBottomColor: theme.palette.primary.dark,
            },
            "&:before": {
              borderBottomColor: theme.palette.primary.main,
            },
            "&:after": {
              borderBottomColor: theme.palette.primary.light,
            },
          },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.dark, // why is this switched?
            userSelect: "none",
            "&:before": {
              color: theme.palette.primary.light,
            },
          },
        },
      },

      MuiButtonGroup: {
        styleOverrides: {
          root: {
            "& .MuiButton-root:not(:last-of-type)": {
              marginRight: "1px",
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            backgroundColor: theme.colors.button,
            border: "1px solid " + theme.palette.background.paper,
            // color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.colors.backgroundsecondary,
            },

            borderRadius: 0,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          icon: {
            color: theme.palette.primary.main,
          },
        },
        defaultProps: {
          variant: "standard",
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "standard",
        },
      },
      MuiTypography: {
        defaultProps: {
          color: "primary",
        },
        styleOverrides: {
          root: {
            lineHeight: Settings.styles.lineHeight,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          list: {
            backgroundColor: theme.palette.background.paper,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.main,
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.default,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor: theme.colors.backgroundsecondary,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { color: theme.palette.primary.main },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: "1em",
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 0,
            border: "2px solid " + theme.colors.white,
            maxWidth: "100vh",
          },
          popper: {
            zIndex: 25000,
          },
        },
        defaultProps: {
          disableInteractive: true,
        },
      },
      MuiSlider: {
        styleOverrides: {
          valueLabel: {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            "&::-webkit-scrollbar": {
              // webkit
              display: "none",
            },
            scrollbarWidth: "none", // firefox
            backgroundColor: theme.colors.backgroundsecondary,
          },
          paperAnchorDockedLeft: {
            borderRight: "1px solid " + theme.colors.welllight,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: theme.colors.welllight,
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.main,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: theme.palette.primary.dark,
          },
          track: {
            backgroundColor: theme.colors.welllight,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            backgroundColor: theme.colors.backgroundsecondary,
            border: "1px solid " + theme.colors.welllight,
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          select: {
            color: theme.palette.primary.main,
          },
          selectLabel: {
            color: theme.palette.primary.main,
          },
          displayedRows: {
            color: theme.palette.primary.main,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          textColorPrimary: {
            color: theme.palette.secondary.main,
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
          root: {
            backgroundColor: theme.colors.backgroundsecondary,
            border: "1px solid " + theme.palette.background.paper,
            margin: "3px",

            "&.Mui-selected": {
              backgroundColor: theme.colors.button,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          scrollButtons: {
            backgroundColor: theme.colors.backgroundsecondary,
            color: theme.palette.secondary.main,
            margin: "3px",
            opacity: 1,
            width: "fit-content",

            "&.Mui-disabled": {
              opacity: 0.5,
            },
          },
        },
        defaultProps: {
          TabIndicatorProps: {
            style: {
              display: "none",
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: theme.colors.backgroundsecondary,
            borderRadius: 0,
            border: "1px solid " + theme.palette.background.paper,
          },
          standardSuccess: {
            color: theme.palette.success.light,
          },
          standardError: {
            color: theme.palette.error.light,
          },
          standardWarning: {
            color: theme.palette.warning.light,
          },
          standardInfo: {
            color: theme.palette.info.light,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          option: {
            color: theme.palette.primary.main,
          },
          inputRoot: {
            height: "100%",
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          root: {
            zIndex: 20000,
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            fontFamily: Settings.styles.fontFamily,
          },
        },
      },
    },
  });

  document.body.style.backgroundColor = theme.palette.background.default?.toString() ?? "black";

  const styleSheet =
    ":root {" +
    Object.entries(Settings.theme)
      .map(([k, v]) => `--bb-theme-${k}: ${v}`)
      .join(";") +
    "}";

  themeStyleSheet.replaceSync(styleSheet);
}

document.adoptedStyleSheets.push(themeStyleSheet);
refreshTheme();

interface IProps {
  children: JSX.Element[] | JSX.Element;
}

export const TTheme = ({ children }: IProps): React.ReactElement => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </StyledEngineProvider>
);
