import React from "react";
import { Worm } from "../Worm";
import { Tooltip, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";
import { MathJax } from "better-react-mathjax";
import { BonusType, formatBonusDescription, getBonusEffect, getBonusFormattingType } from "../BonusType";

interface IProps {
  worm: Worm;
  bonus: BonusType;
}

const bonusEffectStyles = makeStyles((theme: Theme) => ({
  effectText: {
    color: theme.colors.int,
  },
  maximumText: {
    color: theme.colors.cha,
  },
}));

export function WormBonusEffect({ worm, bonus }: IProps) {
  const classes = bonusEffectStyles();

  if (bonus.g === 0) {
    return <Typography className={classes.effectText}>Effect: {bonus.description}</Typography>;
  }

  return (
    <>
      <Tooltip
        title={
          <>
            <Typography>Multiplier formula:</Typography>
            <MathJax>{`\\(\\huge{M = ${bonus.g} ${bonus.a - bonus.g < 0 ? "-" : "+"} ${
              Math.round(Math.abs(bonus.a - bonus.g) * 100) / 100
            } * e^{-${bonus.k} x^{${bonus.m}}}}\\)`}</MathJax>
          </>
        }
      >
        <Typography className={classes.effectText}>
          Effect: {formatBonusDescription(getBonusEffect(bonus, worm.completions), bonus.description)}
        </Typography>
      </Tooltip>
      <Typography className={classes.maximumText}>
        Maximum: {formatBonusDescription(bonus.g, getBonusFormattingType(bonus.description))}
      </Typography>
    </>
  );
}
