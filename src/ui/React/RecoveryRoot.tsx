import React, { useEffect } from "react";

import { Typography, Link, Button, ButtonGroup, Tooltip, Box, Paper, TextField } from "@mui/material";
import { Settings } from "../../Settings/Settings";
import { load } from "../../db";
import { Router } from "../GameRoot";
import { Page } from "../Router";
import { IErrorData, newIssueUrl } from "../../utils/ErrorHelper";
import { DeleteGameButton } from "./DeleteGameButton";
import { SoftResetButton } from "./SoftResetButton";

import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import GitHubIcon from "@mui/icons-material/GitHub";
import { isBinaryFormat } from "../../../electron/saveDataBinaryFormat";
import { InvalidSaveData, UnsupportedSaveData } from "../../utils/SaveDataUtils";
import { downloadContentAsFile } from "../../utils/FileUtils";

export let RecoveryMode = false;
let sourceError: unknown;

export function ActivateRecoveryMode(error: unknown): void {
  RecoveryMode = true;
  sourceError = error;
}

interface IProps {
  softReset: () => void;
  errorData?: IErrorData;
  resetError?: () => void;
}

export function RecoveryRoot({ softReset, errorData, resetError }: IProps): React.ReactElement {
  function recover(): void {
    if (resetError) resetError();
    RecoveryMode = false;
    sourceError = undefined;
    Router.toPage(Page.Terminal);
  }
  Settings.AutosaveInterval = 0;

  useEffect(() => {
    load()
      .then((content) => {
        const epochTime = Math.round(Date.now() / 1000);
        const extension = isBinaryFormat(content) ? "json.gz" : "json";
        const filename = `RECOVERY_BITBURNER_${epochTime}.${extension}`;
        downloadContentAsFile(content, filename);
      })
      .catch((err) => console.error(err));
  }, []);

  let instructions;
  if (sourceError instanceof UnsupportedSaveData) {
    instructions = <Typography variant="h6">Please update your browser.</Typography>;
  } else if (sourceError instanceof InvalidSaveData) {
    instructions = (
      <Typography variant="h6">Your save data is invalid. Please import a valid backup save file.</Typography>
    );
  } else {
    instructions = (
      <Box>
        <Typography>It is recommended to alert a developer.</Typography>
        <Typography>
          <Link href={errorData?.issueUrl ?? newIssueUrl} target="_blank">
            File an issue on github
          </Link>
        </Typography>
        <Typography>
          <Link href="https://www.reddit.com/r/Bitburner/" target="_blank">
            Make a reddit post
          </Link>
        </Typography>
        <Typography>
          <Link href="https://discord.gg/TFc3hKD" target="_blank">
            Post in the #bug-report channel on Discord.
          </Link>
        </Typography>
        <Typography>Please include your save file.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: "8px 16px", minHeight: "100vh", maxWidth: "1200px", boxSizing: "border-box" }}>
      <Typography variant="h3">RECOVERY MODE ACTIVATED</Typography>
      <Typography>
        There was an error with your save file and the game went into recovery mode. In this mode, saving is disabled
        and the game will automatically export your save file to prevent corruption.
      </Typography>
      <br />
      {sourceError && (
        <Box>
          <Typography variant="h6" color={Settings.theme.error}>
            Error: {sourceError.toString()}
          </Typography>
          <br />
        </Box>
      )}
      {instructions}
      <br />
      <Typography>You can disable the recovery mode, but the game may not work correctly.</Typography>
      <ButtonGroup sx={{ my: 2 }}>
        <Tooltip title="Disable the recovery mode and attempt to head back to the terminal page. This may or may not work. Ensure you saved the recovery file.">
          <Button onClick={recover} startIcon={<DirectionsRunIcon />}>
            Disable Recovery Mode
          </Button>
        </Tooltip>
        <SoftResetButton color="warning" onTriggered={softReset} />
        <DeleteGameButton color="error" />
      </ButtonGroup>

      {errorData && (
        <Paper sx={{ px: 2, pt: 1, pb: 2, mt: 2 }}>
          <Typography variant="h5">{errorData.title}</Typography>
          <Box sx={{ my: 2 }}>
            <TextField
              label="Bug Report Text"
              value={errorData.body}
              variant="outlined"
              color="secondary"
              multiline
              fullWidth
              rows={12}
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
              href={errorData.issueUrl ?? newIssueUrl}
              target={"_blank"}
            >
              Submit Issue to GitHub
            </Button>
          </Tooltip>
        </Paper>
      )}
    </Box>
  );
}
