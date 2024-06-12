import LinearProgress from "@mui/material/LinearProgress";
import { Theme } from "@mui/material/styles";
import { withStyles } from "tss-react/mui";

export const ProgressBar = withStyles(LinearProgress, (theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  bar: {
    transition: "none",
    backgroundColor: theme.palette.primary.main,
  },
}));
