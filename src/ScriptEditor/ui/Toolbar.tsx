import React from "react";
import * as monaco from "monaco-editor";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import SettingsIcon from "@mui/icons-material/Settings";

import { makeTheme } from "./themes";

import { Modal } from "../../ui/React/Modal";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { useBoolean } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";
import { OptionsModal, OptionsModalProps } from "./OptionsModal";
import { useScriptEditorContext } from "./ScriptEditorContext";
import { NsApiDocumentationLink } from "../../ui/React/NsApiDocumentationLink";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface IProps {
  editor: IStandaloneCodeEditor | null;
  onSave: () => void;
}

export function Toolbar({ editor, onSave }: IProps) {
  const [ramInfoOpen, { on: openRAMInfo, off: closeRAMInfo }] = useBoolean(false);
  const [optionsOpen, { on: openOptions, off: closeOptions }] = useBoolean(false);

  function beautify(): void {
    editor
      ?.getAction("editor.action.formatDocument")
      ?.run()
      .catch((error) => console.error(error));
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
          <NsApiDocumentationLink />
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
        <Tooltip
          title={
            "Static RAM costs of individual functions used by this script. " +
            "Calling `ns.ramOverride()` with a constant number as the first statement in " +
            "your script will override the value here, as well."
          }
        >
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
        </Tooltip>
      </Modal>
    </>
  );
}
