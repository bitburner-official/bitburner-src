import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";

import WarningIcon from "@mui/icons-material/Warning";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { Skills } from "@nsdefs";

import { ImportData, saveObject } from "../../../SaveObject";
import { Settings } from "../../../Settings/Settings";
import { convertTimeMsToTimeElapsedString } from "../../../utils/StringHelperFunctions";
import { formatMoney, formatNumberNoSuffix } from "../../formatNumber";
import { ConfirmationModal } from "../ConfirmationModal";
import { pushImportResult } from "../../../Electron";
import { Router } from "../../GameRoot";
import { Page } from "../../Router";
import { useBoolean } from "../hooks";

import { ComparisonIcon } from "./ComparisonIcon";
import { SaveData } from "../../../types";
import { handleGetSaveDataError } from "../../../Netscript/ErrorMessages";

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: "1000px",

    "& .MuiTable-root": {
      "& .MuiTableCell-root": {
        borderBottom: `1px solid ${Settings.theme.welllight}`,
      },

      "& .MuiTableHead-root .MuiTableRow-root": {
        backgroundColor: Settings.theme.backgroundsecondary,

        "& .MuiTableCell-root": {
          color: Settings.theme.primary,
          fontWeight: "bold",
        },
      },

      "& .MuiTableBody-root": {
        "& .MuiTableRow-root:nth-of-type(odd)": {
          backgroundColor: Settings.theme.well,

          "& .MuiTableCell-root": {
            color: Settings.theme.primarylight,
          },
        },
        "& .MuiTableRow-root:nth-of-type(even)": {
          backgroundColor: Settings.theme.backgroundsecondary,

          "& .MuiTableCell-root": {
            color: Settings.theme.primarylight,
          },
        },
      },
    },
  },

  skillTitle: {
    textTransform: "capitalize",
  },
}));

// TODO: move to game constants and/or extract as an enum
const playerSkills: (keyof Skills)[] = ["hacking", "strength", "defense", "dexterity", "agility", "charisma"];

let initialAutosave = 0;

export const ImportSave = (props: { saveData: SaveData; automatic: boolean }): JSX.Element => {
  const { classes } = useStyles();
  const [importData, setImportData] = useState<ImportData | undefined>();
  const [currentData, setCurrentData] = useState<ImportData | undefined>();
  const [isImportModalOpen, { on: openImportModal, off: closeImportModal }] = useBoolean(false);
  const [isSkillsExpanded, { toggle: toggleSkillsExpand }] = useBoolean(true);
  const [headback, setHeadback] = useState(false);

  const handleGoBack = (): void => {
    Settings.AutosaveInterval = initialAutosave;
    pushImportResult(false);
    Router.allowRouting(true);
    setHeadback(true);
  };

  const handleImport = async (): Promise<void> => {
    await saveObject.importGame(props.saveData, true);
    pushImportResult(true);
  };

  useEffect(() => {
    // We want to disable autosave while we're in this mode
    initialAutosave = Settings.AutosaveInterval;
    Settings.AutosaveInterval = 0;
    Router.allowRouting(false);
  }, []);

  useEffect(() => {
    if (headback) Router.toPage(Page.Terminal);
  }, [headback]);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const dataBeingImported = await saveObject.getImportDataFromSaveData(props.saveData);
      const dataCurrentlyInGame = await saveObject.getImportDataFromSaveData(await saveObject.getSaveData(true));

      setImportData(dataBeingImported);
      setCurrentData(dataCurrentlyInGame);

      return Promise.resolve();
    }
    if (props.saveData) {
      fetchData().catch((error) => {
        handleGoBack();
        // We cannot show dialog box in this screen (due to "withPopups = false"), so we will try showing it with a
        // delay. 1 second is usually enough to go back to other normal screens that allow showing popups.
        setTimeout(() => {
          handleGetSaveDataError(error);
        }, 1000);
      });
    }
  }, [props.saveData]);

  if (!importData || !currentData) return <></>;

  return (
    <Box className={classes.root}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Import Save Comparison
      </Typography>
      {props.automatic && (
        <Typography sx={{ mb: 2 }}>
          We've found a <b>NEWER save</b> that you may want to use instead.
        </Typography>
      )}
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your current game's data is on the left and the data that will be imported is on the right.
        <br />
        Please double check everything is fine before proceeding!
      </Typography>
      <TableContainer color="secondary" component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Current Game</TableCell>
              <TableCell>Being Imported</TableCell>
              <TableCell width={56}></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell>Game Identifier</TableCell>
              <TableCell>{currentData.playerData?.identifier ?? "n/a"}</TableCell>
              <TableCell>{importData.playerData?.identifier ?? "n/a"}</TableCell>
              <TableCell>
                {importData.playerData?.identifier !== currentData.playerData?.identifier && (
                  <Tooltip title="These are two different games!">
                    <WarningIcon color="warning" />
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Playtime</TableCell>
              <TableCell>{convertTimeMsToTimeElapsedString(currentData.playerData?.totalPlaytime ?? 0)}</TableCell>
              <TableCell>{convertTimeMsToTimeElapsedString(importData.playerData?.totalPlaytime ?? 0)}</TableCell>
              <TableCell>
                {importData.playerData?.totalPlaytime !== currentData.playerData?.totalPlaytime && (
                  <ComparisonIcon
                    isBetter={
                      (importData.playerData?.totalPlaytime ?? 0) > (currentData.playerData?.totalPlaytime ?? 0)
                    }
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Saved On</TableCell>
              <TableCell>
                {(currentData.playerData?.lastSave ?? 0) > 0
                  ? new Date(currentData.playerData?.lastSave ?? 0).toLocaleString()
                  : "n/a"}
              </TableCell>
              <TableCell>
                {(importData.playerData?.lastSave ?? 0) > 0
                  ? new Date(importData.playerData?.lastSave ?? 0).toLocaleString()
                  : "n/a"}
              </TableCell>
              <TableCell>
                {importData.playerData?.lastSave !== currentData.playerData?.lastSave && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.lastSave ?? 0) > (currentData.playerData?.lastSave ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Money</TableCell>
              <TableCell>{formatMoney(currentData.playerData?.money ?? 0)}</TableCell>
              <TableCell>{formatMoney(importData.playerData?.money ?? 0)}</TableCell>
              <TableCell>
                {importData.playerData?.money !== currentData.playerData?.money && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.money ?? 0) > (currentData.playerData?.money ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}>
                <IconButton aria-label="expand row" size="small" onClick={toggleSkillsExpand}>
                  {isSkillsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
                Skills
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} padding="none">
                <Collapse in={isSkillsExpanded}>
                  <Table>
                    <TableBody>
                      <TableRow>{/* empty row to keep even/odd coloring */}</TableRow>
                      {playerSkills.map((skill) => {
                        const currentSkill = currentData.playerData?.skills[skill] ?? 0;
                        const importSkill = importData.playerData?.skills[skill] ?? 0;
                        return (
                          <TableRow key={skill}>
                            <TableCell className={classes.skillTitle}>{skill}</TableCell>
                            <TableCell>{formatNumberNoSuffix(currentSkill, 0)}</TableCell>
                            <TableCell>{formatNumberNoSuffix(importSkill, 0)}</TableCell>
                            <TableCell width={56}>
                              {currentSkill !== importSkill && <ComparisonIcon isBetter={importSkill > currentSkill} />}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {playerSkills.length % 2 === 1 && (
                        <TableRow>{/* empty row to keep even/odd coloring */}</TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Collapse>
              </TableCell>
            </TableRow>
            <TableRow>{/* empty row to keep even/odd coloring */}</TableRow>

            <TableRow>
              <TableCell>Augmentations</TableCell>
              <TableCell>{currentData.playerData?.augmentations}</TableCell>
              <TableCell>{importData.playerData?.augmentations}</TableCell>
              <TableCell>
                {importData.playerData?.augmentations !== currentData.playerData?.augmentations && (
                  <ComparisonIcon
                    isBetter={
                      (importData.playerData?.augmentations ?? 0) > (currentData.playerData?.augmentations ?? 0)
                    }
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Factions</TableCell>
              <TableCell>{currentData.playerData?.factions}</TableCell>
              <TableCell>{importData.playerData?.factions}</TableCell>
              <TableCell>
                {importData.playerData?.factions !== currentData.playerData?.factions && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.factions ?? 0) > (currentData.playerData?.factions ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Achievements</TableCell>
              <TableCell>{currentData.playerData?.achievements}</TableCell>
              <TableCell>{importData.playerData?.achievements}</TableCell>
              <TableCell>
                {importData.playerData?.achievements !== currentData.playerData?.achievements && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.achievements ?? 0) > (currentData.playerData?.achievements ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <Tooltip title="The total SF levels owned, except for SF-1 Exploit levels.">
                <TableCell>Source File Levels</TableCell>
              </Tooltip>
              <TableCell>{currentData.playerData?.sourceFiles}</TableCell>
              <TableCell>{importData.playerData?.sourceFiles}</TableCell>
              <TableCell>
                {importData.playerData?.sourceFiles !== currentData.playerData?.sourceFiles && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.sourceFiles ?? 0) > (currentData.playerData?.sourceFiles ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <Tooltip title="Number of exploits owned.">
                <TableCell>Exploits</TableCell>
              </Tooltip>
              <TableCell>{currentData.playerData?.exploits}</TableCell>
              <TableCell>{importData.playerData?.exploits}</TableCell>
              <TableCell>
                {importData.playerData?.exploits !== currentData.playerData?.exploits && (
                  <ComparisonIcon
                    isBetter={(importData.playerData?.exploits ?? 0) > (currentData.playerData?.exploits ?? 0)}
                  />
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <Tooltip title="The player's current BitNode.">
                <TableCell>BitNode</TableCell>
              </Tooltip>
              <TableCell>
                {currentData.playerData?.bitNode}-{currentData.playerData?.bitNodeLevel}
              </TableCell>
              <TableCell>
                {importData.playerData?.bitNode}-{importData.playerData?.bitNodeLevel}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ButtonGroup>
          <Button onClick={handleGoBack} sx={{ my: 2 }} startIcon={<ArrowBackIcon />} color="secondary">
            Take me back!
          </Button>
          <Button onClick={openImportModal} sx={{ my: 2 }} startIcon={<DirectionsRunIcon />} color="warning">
            Proceed with import
          </Button>
        </ButtonGroup>
        <ConfirmationModal
          open={isImportModalOpen}
          onClose={closeImportModal}
          onConfirm={handleImport}
          confirmationText={
            <>
              Importing new save game data will <strong>completely wipe</strong> the current game data!
              <br />
            </>
          }
          additionalButton={<Button onClick={closeImportModal}>Cancel</Button>}
        />
      </Box>
    </Box>
  );
};
