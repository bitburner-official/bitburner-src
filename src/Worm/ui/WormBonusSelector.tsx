import React from "react";
import { Radio, FormControl, FormControlLabel, RadioGroup, Grid, Paper } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { bonuses } from "../BonusType";
import { makeStyles } from "@mui/styles";

interface IProps {
  currentBonus: string;
  setCurrentBonus: (name: string) => void;
}

const selectorStyles = makeStyles((theme: Theme) => ({
  radioContainer: {
    height: "80px",
    border: `1px solid ${theme.palette.secondary.dark}`,
    textAlign: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
    display: "flex",
    justifyContent: "center",
  },
  selectedRadio: {
    borderColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
  radioLabel: {
    margin: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
  },
  hideCircle: {
    display: "none",
    padding: "100%",
  },
}));

export function WormBonusSelector({ currentBonus, setCurrentBonus }: IProps) {
  const classes = selectorStyles();

  return (
    <FormControl component="fieldset">
      <RadioGroup value={currentBonus} onChange={(event) => setCurrentBonus(event.target.value)}>
        <Grid container spacing={2}>
          {bonuses.map((bonus) => (
            <Grid item xs={6} key={bonus.name}>
              <Paper
                className={`${classes.radioContainer} ${currentBonus === bonus.name ? classes.selectedRadio : ""}`}
              >
                <FormControlLabel
                  value={bonus.name}
                  control={<Radio className={classes.hideCircle} />}
                  label={`${bonus.name} (#${bonus.id})`}
                  className={classes.radioLabel}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </FormControl>
  );
}
