import React from "react";
import { useState } from "react";

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

export function SourceFilesDev(): React.ReactElement {
  const [sfData, setSfData] = useState({
    1: Player.sourceFileLvl(1),
    2: Player.sourceFileLvl(2),
    3: Player.sourceFileLvl(3),
    4: Player.sourceFileLvl(4),
    5: Player.sourceFileLvl(5),
    6: Player.sourceFileLvl(6),
    7: Player.sourceFileLvl(7),
    8: Player.sourceFileLvl(8),
    9: Player.sourceFileLvl(9),
    10: Player.sourceFileLvl(10),
    11: Player.sourceFileLvl(11),
    12: Player.sourceFileLvl(12),
    13: Player.sourceFileLvl(13),
  });

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

  const ownedStyle = { borderColor: "green", background: "" };
  const notOwnedStyle = { borderColor: "", background: "black" };

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
                <Typography>All:</Typography>
              </td>
              <td>
                <ButtonGroup>
                  <Button aria-label="all-sf-0" onClick={setAllSF(0)}>
                    0
                  </Button>
                  <Button aria-label="all-sf-1" onClick={setAllSF(1)}>
                    1
                  </Button>
                  <Button aria-label="all-sf-2" onClick={setAllSF(2)}>
                    2
                  </Button>
                  <Button aria-label="all-sf-3" onClick={setAllSF(3)}>
                    3
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
            {validSFN.map((i) => (
              <tr key={"sf-" + i}>
                <td>
                  <Typography>SF-{i}:</Typography>
                </td>
                <td>
                  <ButtonGroup>
                    <Button onClick={setSF(i, 0)} style={Player.sourceFileLvl(i) >= 0 ? ownedStyle : notOwnedStyle}>
                      0
                    </Button>
                    <Button onClick={setSF(i, 1)} style={Player.sourceFileLvl(i) >= 1 ? ownedStyle : notOwnedStyle}>
                      1
                    </Button>
                    <Button onClick={setSF(i, 2)} style={Player.sourceFileLvl(i) >= 2 ? ownedStyle : notOwnedStyle}>
                      2
                    </Button>
                    <Button onClick={setSF(i, 3)} style={Player.sourceFileLvl(i) >= 3 ? ownedStyle : notOwnedStyle}>
                      3
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
