import React, { useEffect } from "react";

import { Typography, Link, Button, ButtonGroup, Tooltip, Box, Paper, TextField } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { load } from "../../db";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { type CrashReport, newIssueUrl, getCrashReport } from "../../utils/ErrorHelper";
import { DeleteGameButton } from "./DeleteGameButton";
import { SoftResetButton } from "./SoftResetButton";

import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GitHubIcon from "@mui/icons-material/GitHub";
import { isBinaryFormat } from "../../../electron/saveDataBinaryFormat";
import { InvalidSaveData, UnsupportedSaveData } from "../../utils/SaveDataUtils";
import { downloadContentAsFile } from "../../utils/FileUtils";
import { debounce } from "lodash";
import { Engine } from "../../engine";

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
  load()
    .then((content) => {
      const extension = isBinaryFormat(content) ? "json.gz" : "json";
      const filename = `RECOVERY_BITBURNER_${Date.now()}.${extension}`;
      downloadContentAsFile(content, filename);
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
    instructions = (
      <Typography variant="h4" color={Settings.theme.warning}>
        Please update your browser.
      </Typography>
    );
  } else if (sourceError instanceof InvalidSaveData) {
    instructions = (
      <Typography variant="h4" color={Settings.theme.warning}>
        Your save data is invalid. Please import a valid backup save file.
      </Typography>
    );
  } else {
    instructions = (
      <Box>
        <Typography>It is recommended to alert a developer.</Typography>
        <Typography>
          <Link href={crashReport?.issueUrl ?? newIssueUrl} target="_blank">
            File an issue on github
          </Link>
        </Typography>
        <Typography>
          <Link href="https://discord.gg/TFc3hKD" target="_blank">
            Post in the #bug-report channel on Discord.
          </Link>
        </Typography>
        <Typography>
          <Link href="https://www.reddit.com/r/Bitburner/" target="_blank">
            Make a reddit post
          </Link>
        </Typography>
        <Typography variant="h4" color={Settings.theme.warning}>
          Please include your save file and the crash report.
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
      <Typography variant="h3">RECOVERY MODE ACTIVATED</Typography>
      <Typography>
        There was an error with your save file and the game went into recovery mode. In this mode, saving is disabled
        and the game will automatically export your save file to prevent corruption.
      </Typography>
      <br />
      {sourceError && (
        <Box>
          <Typography variant="h6" color={Settings.theme.error}>
            Error: {String(sourceError)}
          </Typography>
          <br />
        </Box>
      )}
      {instructions}
      <div>
        <Button onClick={exportSaveFile}>Export save file</Button>
        {crashReport && (
          <Button onClick={() => exportCrashReport(crashReport.body)} style={{ marginLeft: "20px" }}>
            Export crash report
          </Button>
        )}
      </div>
      <br />
      {canDisableRecoveryMode && (
        <Typography>
          You can disable the recovery mode, but the game may not work correctly, and your save data may be corrupted.
        </Typography>
      )}
      <ButtonGroup sx={{ my: 2 }}>
        {canDisableRecoveryMode && (
          <Tooltip title="Disable the recovery mode and attempt to head back to the terminal page. This may or may not work. Ensure you saved the recovery file.">
            <Button onClick={recover} startIcon={<DirectionsRunIcon />}>
              Disable Recovery Mode
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
                label="Stack Trace"
                value={crashReport.metadata.error.stack}
                variant="outlined"
                multiline
                fullWidth
                spellCheck={false}
              />
            </Paper>
          )}
          <Paper sx={{ px: 2, pt: 1, pb: 2, mt: 2 }}>
            <Typography variant="h5">{crashReport.title}</Typography>
            <Box sx={{ my: 2 }}>
              <TextField
                label="Bug Report Text"
                value={crashReport.body}
                variant="outlined"
                color="secondary"
                multiline
                fullWidth
                rows={40}
                spellCheck={false}
                sx={{ "& .MuiOutlinedInput-root": { color: Settings.theme.secondary } }}
              />
            </Box>
            <Tooltip title="Submitting an issue to GitHub really helps us improve the game!">
              <Button
                component={Link}
                startIcon={<GitHubIcon />}
                color="info"
                sx={{ px: 2 }}
                href={crashReport.issueUrl ?? newIssueUrl}
                target={"_blank"}
              >
                Submit Issue to GitHub
              </Button>
            </Tooltip>
          </Paper>
        </>
      )}
    </Box>
  );
}
