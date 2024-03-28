import React, { useState, useRef } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import { loadGame, saveObject } from "../../SaveObject";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { Upload } from "@mui/icons-material";
import { Button } from "@mui/material";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { SaveData } from "../../types";
import { GetAllServers, loadAllServers, saveAllServers } from "../../Server/AllServers";
import { Player } from "../../Player";
import { killWorkerScriptByPid } from "../../Netscript/killWorkerScript";
import { loadAllRunningScripts } from "../../NetscriptWorker";

export function SaveFileDev(): React.ReactElement {
  const importInput = useRef<HTMLInputElement>(null);
  const [saveData, setSaveData] = useState<SaveData>();
  const [restoreScripts, setRestoreScripts] = useState(true);
  const [restoreAugmentations, setRestoreAugmentations] = useState(true);
  const [restoreSFs, setRestoreSFs] = useState(true);

  async function onImport(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    try {
      const saveData = await saveObject.getSaveDataFromFile(event.target.files);
      setSaveData(saveData);
    } catch (e: unknown) {
      SnackbarEvents.emit(String(e), ToastVariant.ERROR, 5000);
    }
  }

  function startImport(): void {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      return;
    }
    if (!importInput.current) {
      throw new Error("Invalid import input");
    }
    importInput.current.click();
  }

  async function doRestore(): Promise<void> {
    if (!saveData) {
      return;
    }

    // Backup current data
    const currentAllServers = saveAllServers();
    const currentAugmentations = Player.augmentations;
    const currentSFs = Player.sourceFiles;

    // Kill all running scripts
    for (const server of GetAllServers()) {
      for (const byPid of server.runningScriptMap.values()) {
        for (const runningScript of byPid.values()) {
          killWorkerScriptByPid(runningScript.pid);
        }
      }
    }

    // Load save data
    try {
      if (!(await loadGame(saveData))) {
        SnackbarEvents.emit("Cannot load save data", ToastVariant.ERROR, 5000);
        return;
      }
    } catch (error) {
      console.error(error);
      SnackbarEvents.emit(String(error), ToastVariant.ERROR, 5000);
      return;
    }

    // Restore current data if needed
    if (!restoreScripts) {
      loadAllServers(currentAllServers);
    }
    if (!restoreAugmentations) {
      Player.augmentations = currentAugmentations;
    }
    if (!restoreSFs) {
      Player.sourceFiles = currentSFs;
    }

    loadAllRunningScripts();
  }

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Save file</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button onClick={startImport} startIcon={<Upload />} sx={{ gridArea: "import" }}>
          Select save file
          <input ref={importInput} type="file" hidden onChange={onImport} />
        </Button>
        <br />
        {saveData && (
          <>
            <OptionSwitch
              checked={restoreScripts}
              onChange={(v) => setRestoreScripts(v)}
              text="Restore scripts"
              tooltip={<>Restore scripts in all servers.</>}
            />
            <br />
            <OptionSwitch
              checked={restoreAugmentations}
              onChange={(v) => setRestoreAugmentations(v)}
              text="Restore Augmentations"
              tooltip={<>Restore installed augmentations.</>}
            />
            <br />
            <OptionSwitch
              checked={restoreSFs}
              onChange={(v) => setRestoreSFs(v)}
              text="Restore Source Files"
              tooltip={<>Restore acquired source files.</>}
            />
            <br />
            <Button onClick={doRestore}>Restore</Button>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
