import React from "react";
import { Theme } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Fade from "@mui/material/Fade";
import M from "@mui/material/Modal";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { SxProps } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      position: "relative",
      backgroundColor: theme.palette.background.default,
      border: "2px solid " + theme.palette.primary.main,
      boxShadow: `0px 3px 5px -1px ${theme.palette.primary.dark},0px 5px 8px 0px ${theme.palette.primary.dark},0px 1px 14px 0px ${theme.palette.primary.dark}`,
      padding: 2,
      maxWidth: "80%",
      maxHeight: "80%",
      overflow: "auto",
      "&::-webkit-scrollbar": {
        // webkit
        display: "none",
      },
      scrollbarWidth: "none", // firefox
    },
    closeButton: {
      position: "absolute",
      right: 3,
      top: 3,
      width: 20,
      height: 20,
    },
  }),
);

interface IProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const Modal = (props: IProps): React.ReactElement => {
  const classes = useStyles();
  return (
    <M
      disableRestoreFocus
      disableScrollLock
      disableEnforceFocus
      disableAutoFocus
      open={props.open}
      onClose={props.onClose}
      closeAfterTransition
      className={classes.modal}
      sx={props.sx}
    >
      <Fade in={props.open}>
        <div className={classes.paper}>
          <IconButton className={classes.closeButton} onClick={props.onClose}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ m: 2 }}>{props.children}</Box>
        </div>
      </Fade>
    </M>
  );
};
