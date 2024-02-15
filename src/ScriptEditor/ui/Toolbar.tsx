import React from "react";
import * as monaco from "monaco-editor";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";

import SettingsIcon from "@mui/icons-material/Settings";

import { makeTheme, sanitizeTheme } from "./themes";

import { CONSTANTS } from "../../Constants";
import { Modal } from "../../ui/React/Modal";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { useBoolean } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";
import { OptionsModal, OptionsModalProps } from "./OptionsModal";
import { useScriptEditorContext } from "./ScriptEditorContext";

const docUrl =
  "https://github.com/bitburner-official/bitburner-src/blob/" +
  (CONSTANTS.isDevBranch ? "dev" : "stable") +
  "/markdown/bitburner.ns.md";
type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface IProps {
  editor: IStandaloneCodeEditor | null;
  onSave: () => void;
}

export function Toolbar({ editor, onSave }: IProps) {
  const [ramInfoOpen, { on: openRAMInfo, off: closeRAMInfo }] = useBoolean(false);
  const [optionsOpen, { on: openOptions, off: closeOptions }] = useBoolean(false);

  function beautify(): void {
    editor?.getAction("editor.action.formatDocument")?.run();
  }

  const { ram, ramEntries, isUpdatingRAM, options, saveOptions } = useScriptEditorContext();

  const onOptionChange: OptionsModalProps["onOptionChange"] = (option, value) => {
    const newOptions = { ...options, [option]: value };
    saveOptions(newOptions);
    // delaying editor options update to avoid an issue
    // where switching between vim and regular modes causes some settings to be reset
    setTimeout(() => {
      editor?.updateOptions(newOptions);
    }, 100);
  };

  const onThemeChange = () => {
    sanitizeTheme(Settings.EditorTheme);
    monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
  };

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ m: 1 }} alignItems="center">
        <Button startIcon={<SettingsIcon />} onClick={openOptions} sx={{ mr: 1 }}>
          Options
        </Button>
        <Button onClick={beautify}>Beautify</Button>
        <Button color={isUpdatingRAM ? "secondary" : "primary"} sx={{ mx: 1 }} onClick={openRAMInfo}>
          {ram}
        </Button>
        <Button onClick={onSave}>Save (Ctrl/Cmd + s)</Button>
        <Button sx={{ mx: 1 }} onClick={() => Router.toPage(Page.Terminal)}>
          Terminal (Ctrl/Cmd + b)
        </Button>
        <Typography>
          <Link target="_blank" href={docUrl}>
            Documentation
          </Link>
        </Typography>
      </Box>
      <OptionsModal
        open={optionsOpen}
        options={options}
        onClose={closeOptions}
        onOptionChange={onOptionChange}
        onThemeChange={onThemeChange}
      />
      <Modal open={ramInfoOpen} onClose={closeRAMInfo}>
        <Table>
          <TableBody>
            {ramEntries.map(([n, r]) => (
              <React.Fragment key={n + r}>
                <TableRow>
                  <TableCell sx={{ color: Settings.theme.primary }}>{n}</TableCell>
                  <TableCell align="right" sx={{ color: Settings.theme.primary }}>
                    {r}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Modal>
    </>
  );
}
