/**
 * React component for general information about the faction. This includes the
 * factions "motto", reputation, favor, and gameplay instructions
 */
import React from "react";

import { Faction } from "../Faction";
import { FactionInfo } from "../FactionInfo";

import { Reputation } from "../../ui/React/Reputation";
import { Favor } from "../../ui/React/Favor";
import { MathJax } from "better-react-mathjax";

import { makeStyles } from "tss-react/mui";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useCycleRerender } from "../../ui/React/hooks";
import { calculateFavorAfterResetting } from "../formulas/favor";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";

interface IProps {
  faction: Faction;
  factionInfo: FactionInfo;
}

const useStyles = makeStyles()({
  noformat: {
    whiteSpace: "pre-wrap",
  },
});

function DefaultAssignment(): React.ReactElement {
  return (
    <Typography>
      Perform work/carry out assignments for your faction to help further its cause! By doing so, you will earn
      reputation for your faction. You will also gain reputation passively over time, although at a very slow
      rate.&nbsp;
      {knowAboutBitverse() && <>Note that the passive reputation gain is disabled in BitNode 2. </>}
      Earning reputation will allow you to purchase augmentations through this faction, which are powerful upgrades that
      enhance your abilities.
    </Typography>
  );
}

export function Info(props: IProps): React.ReactElement {
  useCycleRerender();
  const { classes } = useStyles();

  const Assignment = props.factionInfo.assignment ?? DefaultAssignment;

  return (
    <>
      <Typography classes={{ root: classes.noformat }}>{props.factionInfo.infoText}</Typography>
      <Typography>-------------------------</Typography>
      <Box display="flex">
        <Tooltip
          title={
            <>
              <Typography>
                You will have{" "}
                <Favor favor={calculateFavorAfterResetting(props.faction.favor, props.faction.playerReputation)} />{" "}
                faction favor after installing an Augmentation.
              </Typography>
              <MathJax>{"\\(\\huge{r = \\text{total faction reputation}}\\)"}</MathJax>
              <MathJax>{"\\(\\huge{favor=\\log_{1.02}\\left(1+\\frac{r}{25000}\\right)}\\)"}</MathJax>
            </>
          }
        >
          <Typography>
            Reputation: <Reputation reputation={props.faction.playerReputation} />
          </Typography>
        </Tooltip>
      </Box>

      <Typography>-------------------------</Typography>

      <Box display="flex">
        <Tooltip
          title={
            <>
              <Typography>
                Faction favor increases the rate at which you earn reputation for this faction by 1% per favor. Faction
                favor is gained whenever you install an Augmentation. The amount of favor you gain depends on the total
                amount of reputation you earned with this faction across all resets.
              </Typography>

              <MathJax>{"\\(\\huge{r = reputation}\\)"}</MathJax>
              <MathJax>{"\\(\\huge{\\Delta r = \\Delta r \\times \\frac{100+favor}{100}}\\)"}</MathJax>
            </>
          }
        >
          <Typography>
            Faction Favor: <Favor favor={props.faction.favor} />
          </Typography>
        </Tooltip>
      </Box>

      <Typography>-------------------------</Typography>
      <Assignment />
    </>
  );
}
