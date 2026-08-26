import {
  BugReport,
  Chat,
  Download,
  LibraryBooks,
  Palette,
  Fingerprint,
  Reddit,
  Save,
  Upload,
} from "@mui/icons-material";
import { Box, Button, List, ListItemButton, Paper, Tooltip, Typography } from "@mui/material";
import { default as React, useRef, useState } from "react";
import { FileDiagnosticModal } from "../../Diagnostic/FileDiagnosticModal";
import { ImportData, getSaveDataFromFile, getImportDataFromSaveData, importGame } from "../../SaveObject";
import { StyleEditorButton } from "../../Themes/ui/StyleEditorButton";
import { ThemeEditorButton } from "../../Themes/ui/ThemeEditorButton";
import { ConfirmationModal } from "../../ui/React/ConfirmationModal";
import { CreditsModal } from "./CreditsModal";
import { DeleteGameButton } from "../../ui/React/DeleteGameButton";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { SoftResetButton } from "../../ui/React/SoftResetButton";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { OptionsTabName } from "./GameOptionsRoot";
import { Player } from "@player";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

interface IProps {
  tab: OptionsTabName;
  setTab: (tab: OptionsTabName) => void;
  save: () => void;
  export: () => void;
  forceKill: () => void;
  softReset: () => void;
  reactivateTutorial: () => void;
}

interface ITabProps {
  sideBarProps: IProps;
  tabName: OptionsTabName;
}

const SideBarTab = (props: ITabProps): React.ReactElement => {
  return (
    <ListItemButton
      selected={props.sideBarProps.tab === props.tabName}
      onClick={() => props.sideBarProps.setTab(props.tabName)}
    >
      <Typography>{props.tabName}</Typography>
    </ListItemButton>
  );
};

export const GameOptionsSidebar = (props: IProps): React.ReactElement => {
  const importInput = useRef<HTMLInputElement>(null);

  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [importSaveOpen, setImportSaveOpen] = useState(false);
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [syncSteamAchievements, setSyncSteamAchievements] = useState(true);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  function startImport(): void {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) return;
    const ii = importInput.current;
    if (ii === null) throw new Error("import input should not be null");
    ii.click();
  }

  async function onImport(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    try {
      const saveData = await getSaveDataFromFile(event.target.files);
      const data = await getImportDataFromSaveData(saveData);
      setImportData(data);
      setImportSaveOpen(true);
      setSyncSteamAchievements(data.playerData?.syncSteamAchievements ?? true);
    } catch (e: unknown) {
      console.error(e);
      SnackbarEvents.emit(String(e), ToastVariant.ERROR, 5000);
    } finally {
      // Re-trigger if we import the same save
      event.target.value = "";
    }
  }

  async function confirmedImportGame(): Promise<void> {
    if (!importData) return;

    try {
      let overrideSettings = undefined;
      if (syncSteamAchievements !== importData.playerData?.syncSteamAchievements) {
        overrideSettings = {
          SyncSteamAchievements: syncSteamAchievements,
        };
      }
      await importGame(importData.saveData, overrideSettings);
    } catch (e: unknown) {
      console.error(e);
      SnackbarEvents.emit(String(e), ToastVariant.ERROR, 5000);
    }

    setImportSaveOpen(false);
    setImportData(null);
  }

  function compareSaveGame(): void {
    if (!importData) return;
    Router.toPage(Page.ImportSave, { saveData: importData.saveData });
    setImportSaveOpen(false);
    setImportData(null);
  }

  return (
    <Box>
      <Paper sx={{ height: "fit-content", mb: 1 }}>
        <List>
          <SideBarTab sideBarProps={props} tabName="System" />
          <SideBarTab sideBarProps={props} tabName="Gameplay" />
          <SideBarTab sideBarProps={props} tabName="Interface" />
          <SideBarTab sideBarProps={props} tabName="Numeric Display" />
          <SideBarTab sideBarProps={props} tabName="Misc" />
          <SideBarTab sideBarProps={props} tabName="Remote API" />
          <SideBarTab sideBarProps={props} tabName="Key Binding" />
        </List>
      </Paper>
      <Box
        sx={{
          display: "grid",
          width: "100%",
          height: "fit-content",
          gridTemplateAreas: `"save   delete"
      "export import"
      "kill   kill"
      "reset  diagnose"
      "browse browse"
      "theme  style"
      "links  links"
      "devs   devs"`,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <Button onClick={() => props.save()} startIcon={<Save />} sx={{ gridArea: "save" }}>
          存档
        </Button>
        <Box sx={{ gridArea: "delete", "& .MuiButton-root": { height: "100%", width: "100%" } }}>
          <DeleteGameButton />
        </Box>
        <Tooltip title={<Typography>将游戏导出为文本文件。</Typography>}>
          <Button onClick={() => props.export()} startIcon={<Download />} sx={{ gridArea: "export" }}>
            导出游戏
          </Button>
        </Tooltip>
        <Tooltip
          title={
            <Typography>
              从文本文件导入游戏。
              <br />
              这将<strong>覆盖</strong>你当前的游戏。请先备份！
            </Typography>
          }
        >
          <Button onClick={startImport} startIcon={<Upload />} sx={{ gridArea: "import" }}>
            导入游戏
            <input
              ref={importInput}
              id="import-game-file-selector"
              type="file"
              hidden
              onChange={(event) => {
                onImport(event).catch((error) => {
                  console.error(error);
                });
              }}
            />
          </Button>
        </Tooltip>
        <ConfirmationModal
          open={importSaveOpen}
          onClose={() => setImportSaveOpen(false)}
          onConfirm={() => {
            confirmedImportGame().catch((error) => {
              console.error(error);
            });
          }}
          additionalButton={<Button onClick={compareSaveGame}>对比存档</Button>}
          confirmationText={
            <>
              导入新游戏将<strong>完全清除</strong>当前数据！
              <br />
              <br />
              导入前请确保已备份当前存档文件。
              <br />
              你尝试导入的文件似乎是有效的。
              {(importData?.playerData?.lastSave ?? 0) > 0 && (
                <>
                  <br />
                  <br />
                  存档文件的导出时间为{" "}
                  <strong>{new Date(importData?.playerData?.lastSave ?? 0).toLocaleString()}</strong>
                </>
              )}
              {(importData?.playerData?.totalPlaytime ?? 0) > 0 && (
                <>
                  <br />
                  <br />
                  导入游戏的累计游戏时长：{" "}
                  {convertTimeMsToTimeElapsedString(importData?.playerData?.totalPlaytime ?? 0)}
                </>
              )}
              <br />
              <br />
              <OptionSwitch
                checked={syncSteamAchievements}
                onChange={(newValue) => setSyncSteamAchievements(newValue)}
                text="同步 Steam 成就"
                tooltip={
                  <>
                    此设置仅用于 Steam 版本。启用后，游戏会自动将你已解锁的 Steam 成就同步到 Steam 云端。
                  </>
                }
              />
              <br />
            </>
          }
        />
        <Tooltip
          title={
            <Typography>
              强制杀死所有正在运行的脚本，以应对游戏出现 bug 或意外问题的情况。使用后请保存游戏并重新加载页面。
              这与普通杀死不同：普通杀死会通知脚本自行关闭，而强制杀死只是移除对脚本的引用（脚本应会自行崩溃）。
              这不会删除你电脑上的文件，只会强制杀死所有脚本的运行实例。
            </Typography>
          }
        >
          <Button onClick={() => props.forceKill()} sx={{ gridArea: "kill" }}>
            强制杀死所有活动脚本
          </Button>
        </Tooltip>
        <Box sx={{ gridArea: "reset", "& .MuiButton-root": { height: "100%", width: "100%" } }}>
          <SoftResetButton onTriggered={props.softReset} />
        </Box>
        <Tooltip
          title={
            <Typography>
              如果你的存档文件过大，可以使用此按钮查看所有服务器上全部文件的映射情况。注意：其中可能包含剧透内容。
            </Typography>
          }
        >
          <Button onClick={() => setDiagnosticOpen(true)} sx={{ gridArea: "diagnose" }}>
            诊断文件
          </Button>
        </Tooltip>
        <Tooltip title="前往主题浏览器查看预置主题合集。">
          <Button startIcon={<Palette />} onClick={() => Router.toPage(Page.ThemeBrowser)} sx={{ gridArea: "browse" }}>
            主题浏览器
          </Button>
        </Tooltip>
        <Box sx={{ gridArea: "theme", "& .MuiButton-root": { height: "100%", width: "100%" } }}>
          <ThemeEditorButton />
        </Box>
        <Box sx={{ gridArea: "style", "& .MuiButton-root": { height: "100%", width: "100%" } }}>
          <StyleEditorButton />
        </Box>

        <Box
          sx={{
            gridArea: "links",
            display: "grid",
            gridTemplateAreas: `"credits credits"
            "bug bug"
        "discord reddit"
        "tut tut"`,
            gridTemplateColumns: "1fr 1fr",
            my: 1,
          }}
        >
          <Tooltip title={<Typography>发起 GitHub issue，帮助开发者查找 bug！</Typography>}>
            <Button
              startIcon={<BugReport />}
              href="https://github.com/bitburner-official/bitburner-src/issues/new"
              target="_blank"
              sx={{ gridArea: "bug" }}
            >
              报告 Bug
            </Button>
          </Tooltip>
          <Button startIcon={<Fingerprint />} onClick={() => setCreditsOpen(true)} sx={{ gridArea: "credits" }}>
            制作人员
          </Button>
          <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
          <Button startIcon={<LibraryBooks />} onClick={() => setConfirmResetOpen(true)} sx={{ gridArea: "tut" }}>
            重玩教程
          </Button>
          <Button startIcon={<Chat />} href="https://discord.gg/TFc3hKD" target="_blank" sx={{ gridArea: "discord" }}>
            Discord
          </Button>
          <Button
            startIcon={<Reddit />}
            href="https://www.reddit.com/r/bitburner"
            target="_blank"
            sx={{ gridArea: "reddit" }}
          >
            Reddit
          </Button>
        </Box>
      </Box>
      <Typography>存档 ID：{Player.identifier}</Typography>
      <FileDiagnosticModal open={diagnosticOpen} onClose={() => setDiagnosticOpen(false)} />

      <ConfirmationModal
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={props.reactivateTutorial}
        confirmationText={"重新开始教程？运行中的脚本将被杀死。"}
        additionalButton={<Button onClick={() => setConfirmResetOpen(false)}>取消</Button>}
      />
    </Box>
  );
};
