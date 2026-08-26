import React from "react";
import { Terminal } from "../../../Terminal";
import { Settings } from "../../../Settings/Settings";
import { Typography } from "@mui/material";
import { DocumentationLink } from "../../../ui/React/DocumentationLink";

export function sendDeprecationNotice() {
  return Terminal.printRaw(
    <Typography sx={{ color: Settings.theme.error }}>
      不支持运行 .script 文件。{" "}
      <DocumentationLink page="migrations/ns2.md" color="inherit">
        点此查看说明
      </DocumentationLink>{" "}
      以将你的脚本迁移为 .js 文件。
    </Typography>,
  );
}
