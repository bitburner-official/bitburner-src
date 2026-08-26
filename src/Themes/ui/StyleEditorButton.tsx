import React, { useState } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import { StyleEditorModal } from "./StyleEditorModal";

export function StyleEditorButton(): React.ReactElement {
  const [styleEditorOpen, setStyleEditorOpen] = useState(false);
  return (
    <>
      <Tooltip title="样式编辑器允许你修改游戏所用的部分 CSS 规则。">
        <Button startIcon={<TextFormatIcon />} onClick={() => setStyleEditorOpen(true)}>
          样式编辑器
        </Button>
      </Tooltip>
      <StyleEditorModal open={styleEditorOpen} onClose={() => setStyleEditorOpen(false)} />
    </>
  );
}
