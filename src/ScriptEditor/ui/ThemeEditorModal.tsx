import React from "react";
import _ from "lodash";

import { Grid, Box, Button, IconButton, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { History, Reply } from "@mui/icons-material";
import { Color, ColorPicker } from "material-ui-color";

import { Settings } from "../../Settings/Settings";
import { useRerender } from "../../ui/React/hooks";
import { Modal } from "../../ui/React/Modal";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

import { defaultMonacoTheme } from "./themes";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { assertAndSanitizeEditorTheme } from "../../JsonSchema/JSONSchemaAssertion";

type ColorEditorProps = {
  label: string;
  themePath: string;
  color: string | undefined;
  onColorChange: (name: string, value: string) => void;
  defaultColor: string;
};

// Slightly tweaked version of the same function found in game options
function ColorEditor({ label, themePath, onColorChange, color, defaultColor }: ColorEditorProps): React.ReactElement {
  if (color === undefined) {
    console.error(`color ${themePath} was undefined, reverting to default`);
    color = defaultColor;
  }

  return (
    <Tooltip title={label}>
      <span>
        <TextField
          label={themePath}
          value={"#" + color}
          sx={{ display: "block", my: 1 }}
          InputProps={{
            readOnly: true,
            startAdornment: (
              <ColorPicker
                hideTextfield
                deferred
                value={"#" + color}
                onChange={(newColor: Color) => onColorChange(themePath, newColor.hex)}
                disableAlpha
              />
            ),
            endAdornment: (
              <IconButton onClick={() => onColorChange(themePath, defaultColor)}>
                <Reply color="primary" />
              </IconButton>
            ),
          }}
        />
      </span>
    </Tooltip>
  );
}

type ThemeEditorProps = {
  onClose: () => void;
  onChange: () => void;
  open: boolean;
};

export function ThemeEditorModal(props: ThemeEditorProps): React.ReactElement {
  const rerender = useRerender();

  function onThemePropChange(prop: string, value: string): void {
    _.set(Settings.EditorTheme, prop, value);
    props.onChange();
    rerender();
  }

  function onThemeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    let themeData: unknown;
    try {
      themeData = JSON.parse(event.target.value);
      assertAndSanitizeEditorTheme(themeData);
    } catch (error) {
      console.error(error);
      console.error("Theme data is invalid. Data:", event.target.value);
      dialogBoxCreate(`无效的主题。错误信息：${error}。`);
      return;
    }
    Object.assign(Settings.EditorTheme, themeData);
    props.onChange();
  }

  const onResetToDefault = () => {
    Settings.EditorTheme = defaultMonacoTheme;
    props.onChange();
    rerender();
  };

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography variant="h4">自定义编辑器主题</Typography>
      <Typography>将鼠标悬停在输入框上以查看更多信息</Typography>
      <Paper sx={{ p: 1, my: 1 }}>
        <OptionSwitch
          checked={Settings.EditorTheme.base === "vs"}
          onChange={(val) => {
            onThemePropChange("base", val ? "vs" : "vs-dark");
          }}
          text="使用浅色主题作为基础"
          tooltip={
            <>
              启用后将使用 <code>vs</code> 浅色主题作为主题基础，否则将使用 <code>vs-dark</code>。
            </>
          }
        />
        <Grid container gap={1} columns={2}>
          <Grid item>
            <Typography variant="h6">界面</Typography>
            <ColorEditor
              label="背景颜色"
              themePath="common.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.bg}
              defaultColor={defaultMonacoTheme.common.bg}
            />
            <ColorEditor
              label="当前行与缩略图的背景颜色"
              themePath="ui.line"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.line}
              defaultColor={defaultMonacoTheme.ui.line}
            />
            <ColorEditor
              label="基础文字颜色"
              themePath="common.fg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.fg}
              defaultColor={defaultMonacoTheme.common.fg}
            />
            <ColorEditor
              label="弹出面板的背景颜色"
              themePath="ui.panel.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.bg}
              defaultColor={defaultMonacoTheme.ui.panel.bg}
            />
            <ColorEditor
              label="弹出面板中选中项的背景颜色"
              themePath="ui.panel.selected"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.selected}
              defaultColor={defaultMonacoTheme.ui.panel.selected}
            />
            <ColorEditor
              label="弹出面板的边框颜色"
              themePath="ui.panel.border"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.panel.border}
              defaultColor={defaultMonacoTheme.ui.panel.border}
            />
            <ColorEditor
              label="高亮文字的背景颜色"
              themePath="ui.selection.bg"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.ui.selection.bg}
              defaultColor={defaultMonacoTheme.ui.selection.bg}
            />
          </Grid>
          <Grid item>
            <Typography variant="h6">语法</Typography>
            <ColorEditor
              label="数字、函数名及其他关键变量"
              themePath="common.accent"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.common.accent}
              defaultColor={defaultMonacoTheme.common.accent}
            />
            <ColorEditor
              label="关键字"
              themePath="syntax.keyword"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.keyword}
              defaultColor={defaultMonacoTheme.syntax.keyword}
            />
            <ColorEditor
              label="字符串"
              themePath="syntax.string"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.string}
              defaultColor={defaultMonacoTheme.syntax.string}
            />
            <ColorEditor
              label="正则表达式字面量及字符串中的转义字符"
              themePath="syntax.regexp"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.regexp}
              defaultColor={defaultMonacoTheme.syntax.regexp}
            />
            <ColorEditor
              label="常量"
              themePath="syntax.constant"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.constant}
              defaultColor={defaultMonacoTheme.syntax.constant}
            />
            <ColorEditor
              label="实体"
              themePath="syntax.entity"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.entity}
              defaultColor={defaultMonacoTheme.syntax.entity}
            />
            <ColorEditor
              label="'this'、'ns'、类型和标签"
              themePath="syntax.tag"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.tag}
              defaultColor={defaultMonacoTheme.syntax.tag}
            />
            <ColorEditor
              label="Netscript 函数与构造函数"
              themePath="syntax.markup"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.markup}
              defaultColor={defaultMonacoTheme.syntax.markup}
            />
            <ColorEditor
              label="错误"
              themePath="syntax.error"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.error}
              defaultColor={defaultMonacoTheme.syntax.error}
            />
            <ColorEditor
              label="注释"
              themePath="syntax.comment"
              onColorChange={onThemePropChange}
              color={Settings.EditorTheme.syntax.comment}
              defaultColor={defaultMonacoTheme.syntax.comment}
            />
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ p: 1 }}>
        <TextField
          multiline
          fullWidth
          maxRows={10}
          label={"导入 / 导出主题"}
          value={JSON.stringify(Settings.EditorTheme, undefined, 2)}
          onChange={onThemeChange}
        />
        <Box sx={{ mt: 1 }}>
          <Button onClick={onResetToDefault} startIcon={<History />}>
            恢复默认
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
}
