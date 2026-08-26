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
import { CurrentKeyBindings, parseKeyCombinationsToString, ScriptEditorAction } from "../../utils/KeyBindingUtils";
import { DocumentationAutocomplete } from "../../Documentation/ui/DocumentationAutocomplete";
import { openDocumentationPopUp } from "../../Documentation/root";
import { defaultNsApiPage, openDocExternally } from "../../ui/React/Documentation";
import { DocumentationLink } from "../../ui/React/DocumentationLink";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface IProps {
  editor: IStandaloneCodeEditor | null;
  onSave: () => Promise<void>;
  onRun: () => Promise<void>;
  onBeautify: () => Promise<void>;
}

export function Toolbar({ editor, onSave, onRun, onBeautify }: IProps) {
  const [ramInfoOpen, { on: openRAMInfo, off: closeRAMInfo }] = useBoolean(false);
  const [optionsOpen, { on: openOptions, off: closeOptions }] = useBoolean(false);

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
          设置
        </Button>
        <Button
          onClick={() => {
            onBeautify().catch((error) => console.error(error));
          }}
        >
          美化代码
        </Button>
        <Button
          color={isUpdatingRAM ? "secondary" : "primary"}
          sx={{ mx: 1, whiteSpace: "nowrap" }}
          onClick={openRAMInfo}
        >
          {ram}
        </Button>
        <Tooltip title={parseKeyCombinationsToString(CurrentKeyBindings[ScriptEditorAction.Save])}>
          <Button
            onClick={() => {
              onSave().catch((error) => console.error(error));
            }}
          >
            保存
          </Button>
        </Tooltip>
        <Tooltip title={parseKeyCombinationsToString(CurrentKeyBindings[ScriptEditorAction.GoToTerminal])}>
          <Button sx={{ mx: 1 }} onClick={() => Router.toPage(Page.Terminal)}>
            终端
          </Button>
        </Tooltip>
        <Tooltip title={parseKeyCombinationsToString(CurrentKeyBindings[ScriptEditorAction.Run])}>
          <Button
            sx={{ mr: 1 }}
            onClick={() => {
              onRun().catch((error) => console.error(error));
            }}
          >
            运行
          </Button>
        </Tooltip>
        <DocumentationAutocomplete
          sx={{ marginRight: "10px" }}
          onChange={(path, external) => {
            if (external) {
              openDocExternally(path);
              return;
            }
            openDocumentationPopUp(path);
          }}
          width={350}
        />
        <Typography>
          <DocumentationLink
            page={defaultNsApiPage}
            fontSize="1.2rem"
            sx={{
              textDecorationThickness: "3px",
              textUnderlineOffset: "5px",
            }}
          >
            NS API 文档
          </DocumentationLink>
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
            "此脚本使用的各个函数的静态 RAM 开销。" +
            "在脚本的第一条语句处调用 `ns.ramOverride()` 并传入一个常数，" +
            "也会覆盖此处显示的值。"
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
