import { Button, Divider, Tooltip, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import React, { useState } from "react";
import { Worm } from "../Worm";
import { formatNumber, formatPercent } from "../../ui/formatNumber";
import { WormBonusModal } from "./WormBonusModal";
import { makeStyles } from "@mui/styles";
import { MathJax } from "better-react-mathjax";
import { wormContractEffect } from "../calculations";
import { Player } from "@player";
import { WormBonusEffect } from "./WormBonusEffect";

interface IProps {
  worm: Worm;
}

const overviewStyles = makeStyles((theme: Theme) => ({
  effectText: {
    color: theme.colors.int,
  },
  completionsText: {
    color: theme.colors.successlight,
  },
  stackContainer: {
    display: "flex",
    flexDirection: "row",
  },
  stackSegment: {
    width: "calc(100% - 25px)",
    marginInline: "10px",
  },
}));

export function WormOverview({ worm }: IProps) {
  const [bonusModalOpen, setBonusModalOpen] = useState(false);

  const contractEffect = wormContractEffect(Player.numContractsSolved);

  const classes = overviewStyles();

  return (
    <>
      <Typography variant="h5">Overview</Typography>
      <Typography>
        The Worm is a highly complex program that infected the entire bitnode and created a giant network of resources.
        <br />
        Simulating the behaviour of the virus gives you access to a small portion of its wealth.
        <br />
        Though the program is not easily deceived, emulating the way it calculates the properties of one of its infected
        networks allows you to bypass most of its security measures.
        <br />
        It is your task to develop a program that can solve the network properties as efficient as possible.
      </Typography>
      <Divider sx={{ my: 1.5 }} />
      <div className={classes.stackContainer}>
        <div className={classes.stackSegment}>
          <Typography variant="h5">Bonus</Typography>
          <Typography className={classes.completionsText}>
            Current Completions: {formatNumber(worm.completions)}
          </Typography>
          <br />
          <Typography>
            Current Bonus: {worm.bonus.name} (#{worm.bonus.id})
          </Typography>
          <WormBonusEffect worm={worm} bonus={worm.bonus} />
          <br />
          <WormBonusModal worm={worm} open={bonusModalOpen} onClose={() => setBonusModalOpen(false)} />
          <Button onClick={() => setBonusModalOpen(true)}>Change Bonus</Button>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className={classes.stackSegment}>
          <Typography variant="h5">Contract influence</Typography>
          <Typography>
            The more coding contracts you solve, the faster your inputs get processed by the Worm.
          </Typography>
          <br />
          <Typography>Solved Coding Contracts: {Player.numContractsSolved}</Typography>
          <Tooltip
            title={
              <>
                <Typography>Multiplier formula:</Typography>
                <MathJax>{"\\(\\huge{M = e^{- \\log{\\left(\\frac{x}{200} + 1\\right)}}}\\)"}</MathJax>
              </>
            }
          >
            <Typography className={classes.effectText}>
              Current effect: -{formatPercent(1 - contractEffect)} processing time required
            </Typography>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
