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
import ThumbUpAlt from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAlt from "@mui/icons-material/ThumbDownAlt";

import { Skills } from "@nsdefs";

import { ImportData, getSaveData, getImportDataFromSaveData, importGame } from "../../SaveObject";
import { Settings } from "../../Settings/Settings";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { formatMoney, formatNumberNoSuffix } from "../formatNumber";
import { ConfirmationModal } from "./ConfirmationModal";
import { pushImportResult } from "../../Electron";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { useBoolean } from "./hooks";

import { SaveData } from "../../types";
import { handleGetSaveDataInfoError } from "../../utils/ErrorHandler";
import { OptionSwitch } from "./OptionSwitch";

const ComparisonIcon = ({ isBetter }: { isBetter: boolean }): JSX.Element => {
  const title = isBetter ? "导入的数值更大！" : "导入的数值更小！";
  const icon = isBetter ? <ThumbUpAlt color="success" /> : <ThumbDownAlt color="error" />;

  return <Tooltip title={title}>{icon}</Tooltip>;
};

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: "1000px",

    "& .MuiTable-root": {
      "& .MuiTableCell-root": {
        borderBottom: `1px solid ${Settings.theme.welllight}`,
        width: "30%",
      },
      "& .MuiTableCell-root:last-child": {
        width: "10%",
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

export const ImportSaveComparison = (props: { saveData: SaveData; automatic: boolean }): JSX.Element => {
  const { classes } = useStyles();
  const [importData, setImportData] = useState<ImportData | undefined>();
  const [currentData, setCurrentData] = useState<ImportData | undefined>();
  const [isImportModalOpen, { on: openImportModal, off: closeImportModal }] = useBoolean(false);
  const [isSkillsExpanded, { toggle: toggleSkillsExpand }] = useBoolean(true);
  const [isOthersExpanded, { toggle: toggleOthersExpand }] = useBoolean(true);
  const [headBack, setHeadBack] = useState(false);
  const [syncSteamAchievements, setSyncSteamAchievements] = useState(true);

  const handleGoBack = (): void => {
    Settings.AutosaveInterval = initialAutosave;
    pushImportResult(false);
    Router.allowRouting(true);
    setHeadBack(true);
  };

  const handleImport = async (): Promise<void> => {
    let overrideSettings = undefined;
    if (syncSteamAchievements !== importData?.playerData?.syncSteamAchievements) {
      overrideSettings = {
        SyncSteamAchievements: syncSteamAchievements,
      };
    }
    await importGame(props.saveData, overrideSettings);
  };

  useEffect(() => {
    // We want to disable autosave while we're in this mode
    initialAutosave = Settings.AutosaveInterval;
    Settings.AutosaveInterval = 0;
    Router.allowRouting(false);
  }, []);

  useEffect(() => {
    if (headBack) {
      Router.toPage(Page.Terminal);
    }
  }, [headBack]);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const dataBeingImported = await getImportDataFromSaveData(props.saveData);
      const dataCurrentlyInGame = await getImportDataFromSaveData(await getSaveData(true));

      setImportData(dataBeingImported);
      setCurrentData(dataCurrentlyInGame);
      setSyncSteamAchievements(dataBeingImported.playerData?.syncSteamAchievements ?? true);
    }
    if (props.saveData) {
      fetchData().catch((error) => {
        handleGoBack();
        // We cannot show dialog box in this screen (due to "withPopups = false"), so we will try showing it with a
        // delay. 1 second is usually enough to go back to other normal screens that allow showing popups.
        setTimeout(() => {
          handleGetSaveDataInfoError(error);
        }, 1000);
      });
    }
  }, [props.saveData]);

  if (!importData || !currentData) return <></>;

  return (
    <Box className={classes.root}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        导入存档对比
      </Typography>
      {props.automatic && (
        <Typography sx={{ mb: 2 }}>
          我们发现了一个<b>更新的存档</b>，你或许想改用它。
        </Typography>
      )}
      <Typography variant="body1" sx={{ mb: 2 }}>
        左侧是你当前游戏的数据，右侧是将要导入的数据。
        <br />
        请在继续之前仔细确认一切无误！
      </Typography>
      <TableContainer color="secondary" component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>当前游戏</TableCell>
              <TableCell>正在导入</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell>游戏标识符</TableCell>
              <TableCell>{currentData.playerData?.identifier ?? "无"}</TableCell>
              <TableCell>{importData.playerData?.identifier ?? "无"}</TableCell>
              <TableCell>
                {importData.playerData?.identifier !== currentData.playerData?.identifier && (
                  <Tooltip title="这是两个不同的游戏！">
                    <WarningIcon color="warning" />
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>游戏时长</TableCell>
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
              <TableCell>保存时间</TableCell>
              <TableCell>
                {(currentData.playerData?.lastSave ?? 0) > 0
                  ? new Date(currentData.playerData?.lastSave ?? 0).toLocaleString()
                  : "无"}
              </TableCell>
              <TableCell>
                {(importData.playerData?.lastSave ?? 0) > 0
                  ? new Date(importData.playerData?.lastSave ?? 0).toLocaleString()
                  : "无"}
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
              <TableCell>资金</TableCell>
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
                <IconButton aria-label="展开行" size="small" onClick={toggleSkillsExpand}>
                  {isSkillsExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
                技能
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
                            <TableCell>
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
              <TableCell colSpan={4}>
                <IconButton aria-label="展开行" size="small" onClick={toggleOthersExpand}>
                  {isOthersExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
                其他
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} padding="none">
                <Collapse in={isOthersExpanded}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>强化</TableCell>
                        <TableCell>{currentData.playerData?.augmentations}</TableCell>
                        <TableCell>{importData.playerData?.augmentations}</TableCell>
                        <TableCell>
                          {importData.playerData?.augmentations !== currentData.playerData?.augmentations && (
                            <ComparisonIcon
                              isBetter={
                                (importData.playerData?.augmentations ?? 0) >
                                (currentData.playerData?.augmentations ?? 0)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>派系</TableCell>
                        <TableCell>{currentData.playerData?.factions}</TableCell>
                        <TableCell>{importData.playerData?.factions}</TableCell>
                        <TableCell>
                          {importData.playerData?.factions !== currentData.playerData?.factions && (
                            <ComparisonIcon
                              isBetter={
                                (importData.playerData?.factions ?? 0) > (currentData.playerData?.factions ?? 0)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>成就</TableCell>
                        <TableCell>{currentData.playerData?.achievements}</TableCell>
                        <TableCell>{importData.playerData?.achievements}</TableCell>
                        <TableCell>
                          {importData.playerData?.achievements !== currentData.playerData?.achievements && (
                            <ComparisonIcon
                              isBetter={
                                (importData.playerData?.achievements ?? 0) > (currentData.playerData?.achievements ?? 0)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <Tooltip title="拥有的源文件总等级，不包括 SF-1 漏洞等级。">
                          <TableCell>源文件等级</TableCell>
                        </Tooltip>
                        <TableCell>{currentData.playerData?.sourceFiles}</TableCell>
                        <TableCell>{importData.playerData?.sourceFiles}</TableCell>
                        <TableCell>
                          {importData.playerData?.sourceFiles !== currentData.playerData?.sourceFiles && (
                            <ComparisonIcon
                              isBetter={
                                (importData.playerData?.sourceFiles ?? 0) > (currentData.playerData?.sourceFiles ?? 0)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <Tooltip title="拥有的漏洞数量。">
                          <TableCell>漏洞</TableCell>
                        </Tooltip>
                        <TableCell>{currentData.playerData?.exploits}</TableCell>
                        <TableCell>{importData.playerData?.exploits}</TableCell>
                        <TableCell>
                          {importData.playerData?.exploits !== currentData.playerData?.exploits && (
                            <ComparisonIcon
                              isBetter={
                                (importData.playerData?.exploits ?? 0) > (currentData.playerData?.exploits ?? 0)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <Tooltip title="玩家当前的 BitNode。">
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
                </Collapse>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <OptionSwitch
        checked={syncSteamAchievements}
        onChange={(newValue) => setSyncSteamAchievements(newValue)}
        text="同步 Steam 成就"
        tooltip={
          <>
            此设置仅在 Steam 版中使用。启用后，游戏会自动将你解锁的 Steam 成就同步到 Steam 云。
          </>
        }
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <ButtonGroup>
          <Tooltip title="继续使用当前存档">
            <Button onClick={handleGoBack} sx={{ my: 2 }} startIcon={<ArrowBackIcon />} color="secondary">
              返回当前存档！
            </Button>
          </Tooltip>
          <Tooltip title="导入新存档并重新加载">
            <Button onClick={openImportModal} sx={{ my: 2 }} startIcon={<DirectionsRunIcon />} color="warning">
              继续导入
            </Button>
          </Tooltip>
        </ButtonGroup>
        <ConfirmationModal
          open={isImportModalOpen}
          onClose={closeImportModal}
          onConfirm={() => {
            handleImport().catch((error) => {
              console.error(error);
            });
          }}
          confirmationText={
            <>
              导入新的存档数据将会<strong>完全清空</strong>当前的游戏数据！
              <br />
            </>
          }
          additionalButton={<Button onClick={closeImportModal}>取消</Button>}
        />
      </Box>
    </Box>
  );
};
