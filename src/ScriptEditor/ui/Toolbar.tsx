import React, { useState } from "react";
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

import { Modal } from "../../ui/React/Modal";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { Settings } from "../../Settings/Settings";
import { OptionsModal } from "./OptionsModal";
import { Options } from "./Options";
import { useScriptEditorContext } from "./ScriptEditorContext";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface IProps {
  editor: IStandaloneCodeEditor | null;
  onSave: () => void;
}

export function Toolbar({ editor, onSave }: IProps) {
  const [ramInfoOpen, setRamInfoOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  function beautify(): void {
    editor?.getAction("editor.action.formatDocument")?.run();
  }

  const { ram, ramEntries, isUpdatingRAM, options, saveOptions } = useScriptEditorContext();

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ m: 1 }} alignItems="center">
        <Button startIcon={<SettingsIcon />} onClick={() => setOptionsOpen(true)} sx={{ mr: 1 }}>
          Options
        </Button>
        <Button onClick={beautify}>Beautify</Button>
        <Button
          color={isUpdatingRAM ? "secondary" : "primary"}
          sx={{ mx: 1 }}
          onClick={() => {
            setRamInfoOpen(true);
          }}
        >
          {ram}
        </Button>
        <Button onClick={onSave}>Save (Ctrl/Cmd + s)</Button>
        <Button sx={{ mx: 1 }} onClick={() => Router.toPage(Page.Terminal)}>
          Terminal (Ctrl/Cmd + b)
        </Button>
        <Typography>
          {" "}
          <strong>Documentation:</strong>{" "}
          <Link target="_blank" href="https://bitburner-official.readthedocs.io/en/latest/index.html">
            Basic
          </Link>
          {" | "}
          <Link
            target="_blank"
            href="https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md"
          >
            Full
          </Link>
        </Typography>
      </Box>
      <OptionsModal
        open={optionsOpen}
        options={options}
        onClose={() => {
          sanitizeTheme(Settings.EditorTheme);
          monaco.editor.defineTheme("customTheme", makeTheme(Settings.EditorTheme));
          setOptionsOpen(false);
        }}
        onChange={(option: keyof Options, value: Options[keyof Options]) => {
          saveOptions({ ...options, [option]: value });
          editor?.updateOptions(options);
        }}
      />
      <Modal open={ramInfoOpen} onClose={() => setRamInfoOpen(false)}>
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
