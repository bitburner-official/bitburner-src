import React, { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Player } from "@player";
import ButtonGroup from "@mui/material/ButtonGroup";

// Update as additional BitNodes get implemented
const validSFN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const initialState = validSFN.reduce((obj, sfN) => ({ ...obj, [sfN]: "" }), { "": "" });

export function SourceFilesDev(): React.ReactElement {
  const [sfData, setSfData] = useState(initialState);

  function setSF(sfN: number, sfLvl: number) {
    return function () {
      if (sfN === 9) {
        Player.hacknetNodes = [];
      }
      if (sfLvl === 0) {
        Player.sourceFiles.delete(sfN);
        setSfData({ ...sfData, [sfN]: sfLvl });
        return;
      }
      Player.sourceFiles.set(sfN, sfLvl);
      setSfData({ ...sfData, [sfN]: sfLvl });
    };
  }

  function setAllSF(sfLvl: number) {
    return () => {
      for (let i = 0; i < validSFN.length; i++) {
        setSF(validSFN[i], sfLvl)();
      }
    };
  }

  function clearExploits(): void {
    Player.exploits = [];
  }

  const setallButtonStyle = { borderColor: "", background: "black" };
  const ownedStyle = { borderColor: "green", background: "" };
  const notOwnedStyle = { borderColor: "", background: "black" };

  const devLvls = [0, 1, 2, 3];

  const buttonGroup = (sfN?: number) =>
    devLvls.map((lvl) => {
      return (
        <Button
          key={lvl}
          onClick={sfN === undefined ? setAllSF(lvl) : setSF(sfN, lvl)}
          style={sfN === undefined ? setallButtonStyle : Player.sourceFileLvl(sfN) >= lvl ? ownedStyle : notOwnedStyle}
        >
          {lvl}
        </Button>
      );
    });

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
            <tr key={"sf-all"}>
              <td>
                <Typography>Set All:</Typography>
              </td>
              <td>
                <ButtonGroup>{buttonGroup()}</ButtonGroup>
              </td>
            </tr>
            {validSFN.map((sfN) => (
              <tr key={"sf-" + sfN}>
                <td>
                  <Typography>SF-{sfN}:</Typography>
                </td>
                <td>
                  <ButtonGroup>{buttonGroup(sfN)}</ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
