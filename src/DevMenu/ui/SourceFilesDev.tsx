import React, { useCallback } from "react";

import { Accordion, AccordionSummary, AccordionDetails, Button, ButtonGroup, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";

import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";

// Update as additional BitNodes get implemented
const validSFN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15];
const useStyles = makeStyles({
  group: {
    display: "inline-flex",
    placeItems: "center",
  },
  extraInfo: {
    marginLeft: "0.5em",
  },
});

export function SourceFilesDev(): React.ReactElement {
  const rerender = useRerender();
  const classes = useStyles();

  const setSF = useCallback(
    (sfN: number, sfLvl: number) => () => {
      if (sfN === 9) {
        Player.hacknetNodes = [];
      }
      if (sfLvl === 0) {
        Player.sourceFiles.delete(sfN);
        rerender();
        return;
      }
      Player.sourceFiles.set(sfN, sfLvl);
      rerender();
    },
    [rerender],
  );

  const setAllSF = useCallback((sfLvl: number) => () => validSFN.forEach((sfN) => setSF(sfN, sfLvl)()), [setSF]);
  const clearExploits = () => (Player.exploits = []);

  const devLvls = [0, 1, 2, 3];

  const buttonRow = (sfN?: number) => {
    const title = sfN ? `SF-${sfN}` : "Set All";
    const level = sfN ? Player.sourceFileLvl(sfN) : 0;
    return (
      <tr key={title}>
        <td>
          <Typography>{title}</Typography>
        </td>
        <td>
          <ButtonGroup className={classes.group}>
            {devLvls.map((lvl) => (
              <Button key={lvl} onClick={sfN === undefined ? setAllSF(lvl) : setSF(sfN, lvl)}>
                {lvl}
              </Button>
            ))}
            {sfN === 12 &&
              [1, 10, 100].map((numLevels) => (
                <Button key={numLevels} onClick={setSF(12, level + numLevels)}>
                  +{numLevels}
                </Button>
              ))}
            {sfN && <Typography className={classes.extraInfo}>{`Level: ${level}`}</Typography>}
          </ButtonGroup>
        </td>
      </tr>
    );
  };

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Source-Files</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Exploits:</Typography>
              </td>
              <td>
                <Button onClick={clearExploits}>Clear</Button>
              </td>
            </tr>
            {[undefined, ...validSFN].map((sfN) => buttonRow(sfN))}
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
