import React, { useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { ThemeEditorModal } from "./ThemeEditorModal";
import ColorizeIcon from "@mui/icons-material/Colorize";

export function ThemeEditorButton(): React.ReactElement {
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  return (
    <>
      <Tooltip title="主题编辑器允许你修改游戏所用的颜色。">
        <Button id="bb-theme-editor-button" startIcon={<ColorizeIcon />} onClick={() => setThemeEditorOpen(true)}>
          主题编辑器
        </Button>
      </Tooltip>
      <ThemeEditorModal open={themeEditorOpen} onClose={() => setThemeEditorOpen(false)} />
    </>
  );
}
