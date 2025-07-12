import React, { useCallback } from "react";

import { AccordionSummary, AccordionDetails, Button, ButtonGroup, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "tss-react/mui";

import { Player } from "@player";
import { Sleeve } from "../../PersonObjects/Sleeve/Sleeve";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { MaxSleevesFromCovenant } from "../../PersonObjects/Sleeve/SleeveCovenantPurchases";
import { validBitNodes } from "../../BitNode/Constants";
import { DeleteServer, GetAllServers } from "../../Server/AllServers";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const useStyles = makeStyles()({
  group: {
    display: "inline-flex",
    placeItems: "center",
  },
  extraInfo: {
    marginLeft: "0.5em",
    marginRight: "0.5em",
  },
});

export function SourceFilesDev({ parentRerender }: { parentRerender: () => void }): React.ReactElement {
  const { classes } = useStyles();

  const setSF = useCallback(
    (sfN: number, sfLvl: number) => () => {
      if (sfN === 9) {
        if (sfLvl === 0) {
          // Make sure that Player.hacknetNodes contains only HackNode and there is no hacknet server in "AllServers".
          Player.hacknetNodes = Player.hacknetNodes.filter((node) => typeof node !== "string");
          for (const server of GetAllServers()) {
            if (!(server instanceof HacknetServer)) {
              continue;
            }
            DeleteServer(server.hostname);
          }
        } else {
          // Make sure that Player.hacknetNodes contains only the hostnames of hacknet servers.
          Player.hacknetNodes = Player.hacknetNodes.filter((node) => typeof node === "string");
        }
      }
      if (sfLvl === 0) {
        Player.sourceFiles.delete(sfN);
        Player.bitNodeOptions.sourceFileOverrides.delete(sfN);
        if (sfN === 10) {
          Sleeve.recalculateNumOwned();
        }
        parentRerender();
        return;
      }
      Player.sourceFiles.set(sfN, sfLvl);
      Player.bitNodeOptions.sourceFileOverrides.set(sfN, sfLvl);
      if (sfN === 10) {
        Sleeve.recalculateNumOwned();
      }
      parentRerender();
    },
    [parentRerender],
  );

  const setAllSF = useCallback((sfLvl: number) => () => validBitNodes.forEach((sfN) => setSF(sfN, sfLvl)()), [setSF]);
  const clearExploits = () => (Player.exploits = []);

  const addSleeve = useCallback(() => {
    if (Player.sleevesFromCovenant >= 10) return;
    Player.sleevesFromCovenant += 1;
    Sleeve.recalculateNumOwned();
    parentRerender();
  }, [parentRerender]);

  const removeSleeve = useCallback(() => {
    if (Player.sleevesFromCovenant <= 0) return;
    Player.sleevesFromCovenant -= 1;
    Sleeve.recalculateNumOwned();
    parentRerender();
  }, [parentRerender]);

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
            {sfN === 10 && (
              <>
                <ButtonWithTooltip
                  disabledTooltip={Player.sleevesFromCovenant <= 0 ? "Already at minimum" : ""}
                  onClick={removeSleeve}
                >
                  -1 sleeve
                </ButtonWithTooltip>
                <ButtonWithTooltip
                  disabledTooltip={Player.sleevesFromCovenant >= MaxSleevesFromCovenant ? "Already at maximum" : ""}
                  onClick={addSleeve}
                >
                  +1 sleeve
                </ButtonWithTooltip>
                <Typography className={classes.extraInfo}>Extra sleeves: {Player.sleevesFromCovenant}</Typography>
              </>
            )}
          </ButtonGroup>
        </td>
      </tr>
    );
  };

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_SourceFilesDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Source-Files</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>Note: This tool sets both the owned level and the overridden level.</Typography>
        <br />
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
            {[undefined, ...validBitNodes].map((sfN) => buttonRow(sfN))}
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
