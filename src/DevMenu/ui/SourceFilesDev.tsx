import React, { useCallback, useState } from "react";

import { AccordionSummary, AccordionDetails, Button, ButtonGroup, Typography, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "tss-react/mui";

import { Player } from "@player";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import {
  MaxSleevesFromCovenant,
  recalculateNumberOfOwnedSleeves,
} from "../../PersonObjects/Sleeve/SleeveCovenantPurchases";
import { validBitNodes } from "../../BitNode/Constants";
import { DeleteServer, GetAllServers } from "../../Server/AllServers";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";
import { getDarkscapeNavigator } from "../../DarkNet/effects/effects";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

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
      if (!Number.isInteger(sfLvl) || sfLvl < 0) {
        dialogBoxCreate(`无效的源文件等级：${sfLvl}`);
        return;
      }
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
      if (sfN === 15 && sfLvl !== 0) {
        getDarkscapeNavigator();
      }
      if (sfLvl === 0) {
        Player.sourceFiles.delete(sfN);
        Player.bitNodeOptions.sourceFileOverrides.delete(sfN);
        if (sfN === 10) {
          recalculateNumberOfOwnedSleeves();
        }
        parentRerender();
        return;
      }
      Player.sourceFiles.set(sfN, sfLvl);
      Player.bitNodeOptions.sourceFileOverrides.set(sfN, sfLvl);
      if (sfN === 10) {
        recalculateNumberOfOwnedSleeves();
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
    recalculateNumberOfOwnedSleeves();
    parentRerender();
  }, [parentRerender]);

  const removeSleeve = useCallback(() => {
    if (Player.sleevesFromCovenant <= 0) return;
    Player.sleevesFromCovenant -= 1;
    recalculateNumberOfOwnedSleeves();
    parentRerender();
  }, [parentRerender]);

  const devLvls = [0, 1, 2, 3];

  const ButtonRow = (sfN?: number) => {
    const title = sfN ? `SF-${sfN}` : "全部设置";
    const level = sfN ? Player.sourceFileLvl(sfN) : 0;
    const [newSf12Level, setNewSf12Level] = useState(Player.sourceFileLvl(12));
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
            {sfN === 12 && (
              <>
                <TextField
                  style={{ maxWidth: "90px" }}
                  value={newSf12Level}
                  onChange={(x) => setNewSf12Level(Number(x.target.value))}
                />
                <Button onClick={setSF(12, newSf12Level)}>设置</Button>
              </>
            )}
            {sfN && <Typography className={classes.extraInfo}>{`等级：${level}`}</Typography>}
            {sfN === 10 && (
              <>
                <ButtonWithTooltip
                  disabledTooltip={Player.sleevesFromCovenant <= 0 ? "已达最小值" : ""}
                  onClick={removeSleeve}
                >
                  -1 分身
                </ButtonWithTooltip>
                <ButtonWithTooltip
                  disabledTooltip={Player.sleevesFromCovenant >= MaxSleevesFromCovenant ? "已达最大值" : ""}
                  onClick={addSleeve}
                >
                  +1 分身
                </ButtonWithTooltip>
                <Typography className={classes.extraInfo}>额外分身：{Player.sleevesFromCovenant}</Typography>
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
        <Typography>源文件</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>注意：此工具会同时设置已拥有的等级与覆盖后的等级。</Typography>
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>漏洞：</Typography>
              </td>
              <td>
                <Button onClick={clearExploits}>清除</Button>
              </td>
            </tr>
            {[undefined, ...validBitNodes].map((sfN) => ButtonRow(sfN))}
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
