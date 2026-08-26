import React, { useEffect } from "react";

import { Typography, Link, Button, ButtonGroup, Tooltip, Box, Paper, TextField } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { IndexedDBVersionError, load } from "../../db";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { type CrashReport, newIssueUrl, getCrashReport, isSaveDataFromNewerVersions } from "../../utils/ErrorHelper";
import { DeleteGameButton } from "./DeleteGameButton";
import { SoftResetButton } from "./SoftResetButton";

import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GitHubIcon from "@mui/icons-material/GitHub";
import { isBinaryFormat } from "../../../electron/saveDataBinaryFormat";
import { InvalidSaveData, UnsupportedSaveData } from "../../utils/SaveDataUtils";
import { downloadContentAsFile } from "../../utils/FileUtils";
import { debounce } from "lodash";
import { Engine } from "../../engine";
import { JSONReviverError } from "../../utils/GenericReviver";
import { loadedSaveObjectMiniDump } from "../../SaveObject";
import { CONSTANTS } from "../../Constants";

export let RecoveryMode = false;
let sourceError: unknown;

export function ActivateRecoveryMode(error: unknown): void {
  RecoveryMode = true;
  sourceError = error;
}

interface IProps {
  softReset: () => void;
  crashReport?: CrashReport;
  resetError?: () => void;
}

function exportSaveFile(): void {
  load(true)
    .then((saveData) => {
      if (saveData === undefined) {
        console.error("There is no save data, but the recovery mode was activated.");
        return;
      }
      const extension = isBinaryFormat(saveData) ? "json.gz" : "json";
      const filename = `RECOVERY_BITBURNER_${Date.now()}.${extension}`;
      downloadContentAsFile(saveData, filename);
    })
    .catch((err) => {
      console.error(err);
    });
}

function exportCrashReport(crashReportBody: string): void {
  downloadContentAsFile(crashReportBody, `CRASH_REPORT_BITBURNER_${Date.now()}.txt`);
}

const debouncedExportSaveFile = debounce(exportSaveFile, 1000);

const debouncedExportCrashReport = debounce(exportCrashReport, 2000);

/**
 * The recovery screen can be activated in 2 ways:
 * - Call ActivateRecoveryMode() [1].
 *   - Before loading the save data: An error is thrown in src\ui\LoadingScreen.tsx (e.g., cannot load SWC wasm files,
 * cannot access IndexedDB and load the save data, Engine.load() throws an error).
 *   - isBitNodeFinished() throws an error in src\ui\GameRoot.tsx.
 * - ErrorBoundary [2]: After loading the save data and GameRoot is rendered, an error is thrown anywhere else.
 *
 * [1]: crashReport is undefined and sourceError, which is the error thrown in LoadingScreen.tsx, is set via ActivateRecoveryMode().
 * [2]: RecoveryRoot is rendered twice with 2 different crashReport. For more information, please check the comment in
 * src\ui\ErrorBoundary.tsx.
 */
export function RecoveryRoot({ softReset, crashReport, resetError }: IProps): React.ReactElement {
  function recover(): void {
    if (resetError) resetError();
    RecoveryMode = false;
    sourceError = undefined;
    Router.toPage(Page.Terminal);
  }
  Settings.AutosaveInterval = 0;

  // This happens in [1] mentioned above. crashReport is undefined, so we need to parse sourceError to get crashReport.
  if (crashReport == null && sourceError) {
    crashReport = getCrashReport(sourceError, undefined, Page.LoadingScreen);
  }

  useEffect(() => {
    // This hook is called twice in [2], so we need to debounce exportSaveFile().
    debouncedExportSaveFile();

    /**
     * This hook can be called with 3 types of crashReport:
     * - In [1]: crashReport.metadata.page is Page.LoadingScreen
     * - In [2]:
     *   - First render: crashReport.metadata.reactErrorInfo is undefined
     *   - Second render: crashReport.metadata.reactErrorInfo contains componentStack
     *
     * The following check makes sure that we do not write the crash report in the "first render" of [2].
     */
    if (crashReport && (crashReport.metadata.reactErrorInfo || crashReport.metadata.page === Page.LoadingScreen)) {
      debouncedExportCrashReport(crashReport.body);
    }
  }, [crashReport]);

  let instructions;
  if (sourceError instanceof UnsupportedSaveData) {
    // This specifically is thrown only from needing CompressionStream and not having it.
    instructions = (
      <Typography variant="h4" color={Settings.theme.warning}>
        请更新你的浏览器。
      </Typography>
    );
  } else if (
    isSaveDataFromNewerVersions(loadedSaveObjectMiniDump.VersionSave) ||
    sourceError instanceof IndexedDBVersionError
  ) {
    // We check broadly for the version being mismatched. If the version is
    // newer than we expect, an unknown/unanticipated change to the save
    // format may have occurred, which could result in almost any error type.
    instructions = (
      <Typography variant="h5" color={Settings.theme.warning}>
        {loadedSaveObjectMiniDump.VersionSave !== undefined && (
          <>
            你的存档数据来自更新的版本（版本号：{loadedSaveObjectMiniDump.VersionSave}）。当前
            版本号为 {CONSTANTS.VersionNumber}。
            <br />
          </>
        )}
        请检查你是否使用了正确的构建。在稳定版构建上加载开发版构建（Steam Beta 或
        https://bitburner-official.github.io/bitburner-src）的存档数据时可能会发生这种情况。
      </Typography>
    );
  } else if (sourceError instanceof InvalidSaveData || sourceError instanceof JSONReviverError) {
    // These error types are mostly already covered by the version check above.
    // If they occur while on the same version, it indicates bad save editing.
    instructions = (
      <Typography variant="h4" color={Settings.theme.warning}>
        你的存档数据无效。请导入有效的备份存档文件。
      </Typography>
    );
  } else {
    // If we get this far, we don't know what's going on.
    instructions = (
      <Box>
        <Typography>建议通知开发者。</Typography>
        <Typography>
          <Link href={crashReport?.issueUrl ?? newIssueUrl} target="_blank">
            在 GitHub 上提交 Issue
          </Link>
        </Typography>
        <Typography>
          <Link href="https://discord.gg/TFc3hKD" target="_blank">
            在 Discord 的 #bug-report 频道发帖。
          </Link>
        </Typography>
        <Typography>
          <Link href="https://www.reddit.com/r/Bitburner/" target="_blank">
            发布 Reddit 帖子
          </Link>
        </Typography>
        <Typography variant="h4" color={Settings.theme.warning}>
          请附上你的存档文件和崩溃报告。
        </Typography>
      </Box>
    );
  }

  /**
   * If Engine.isRunning is false, it means that the loading process in src\ui\LoadingScreen.tsx failed, and the loaded
   * data is either empty or corrupted (partially or fully). In this case, there is no reason to allow the player to
   * disable the recovery mode and go back to the main UI.
   */
  const canDisableRecoveryMode = Engine.isRunning;

  return (
    <Box sx={{ padding: "8px 16px", minHeight: "100vh", boxSizing: "border-box" }}>
      <Typography variant="h3">已进入恢复模式</Typography>
      <Typography>
        你的存档文件出现错误，游戏进入了恢复模式。在此模式下无法保存游戏，且游戏会自动导出你的存档文件以防止数据损坏。
      </Typography>
      <br />
      {sourceError && (
        <Box>
          <Typography variant="h6" color={Settings.theme.error}>
            错误：{String(sourceError)}
          </Typography>
          <br />
        </Box>
      )}
      {instructions}
      <div>
        <Button onClick={exportSaveFile}>导出存档文件</Button>
        {crashReport && (
          <Button onClick={() => exportCrashReport(crashReport.body)} style={{ marginLeft: "20px" }}>
            导出崩溃报告
          </Button>
        )}
      </div>
      <br />
      {canDisableRecoveryMode && (
        <Typography>
          你可以禁用恢复模式，但游戏可能无法正常运行，且你的存档数据可能已损坏。
        </Typography>
      )}
      <ButtonGroup sx={{ my: 2 }}>
        {canDisableRecoveryMode && (
          <Tooltip title="禁用恢复模式并尝试返回终端页面。此操作不一定成功。请确保你已保存恢复文件。">
            <Button onClick={recover} startIcon={<DirectionsRunIcon />}>
              禁用恢复模式
            </Button>
          </Tooltip>
        )}
        <SoftResetButton color="warning" onTriggered={softReset} />
        <DeleteGameButton color="error" />
      </ButtonGroup>

      {crashReport && (
        <>
          {crashReport.metadata.error.stack && (
            <Paper>
              <TextField
                label="堆栈跟踪"
                value={crashReport.metadata.error.stack}
                variant="outlined"
                multiline
                fullWidth
                spellCheck={false}
              />
            </Paper>
          )}
          <Typography variant="h4" color={Settings.theme.warning}>
            请勿截取此屏幕的图片。你必须提交下方的错误报告文本。
          </Typography>
          <Paper sx={{ px: 2, pt: 1, pb: 2, mt: 2 }}>
            <Typography variant="h5">{crashReport.title}</Typography>
            <Box sx={{ my: 2 }}>
              <TextField
                label={<Typography sx={{ fontSize: "20px" }}>错误报告文本</Typography>}
                value={crashReport.body}
                variant="outlined"
                color="secondary"
                multiline
                fullWidth
                rows={40}
                spellCheck={false}
                sx={{
                  "& .MuiOutlinedInput-root": { color: Settings.theme.secondary },
                  "& .MuiOutlinedInput-input": { scrollbarWidth: "thin" },
                }}
              />
            </Box>
            <Tooltip title="向 GitHub 提交 Issue 真的能帮助我们改进游戏！">
              <Button
                component={Link}
                startIcon={<GitHubIcon />}
                color="info"
                sx={{ px: 2 }}
                href={crashReport.issueUrl ?? newIssueUrl}
                target={"_blank"}
              >
                向 GitHub 提交 Issue
              </Button>
            </Tooltip>
          </Paper>
        </>
      )}
    </Box>
  );
}
