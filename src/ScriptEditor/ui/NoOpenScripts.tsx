import React from "react";

import Typography from "@mui/material/Typography";

import { Settings } from "../../Settings/Settings";

export function NoOpenScripts() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span style={{ color: Settings.theme.primary, fontSize: "20px", textAlign: "center" }}>
        <Typography variant="h4">没有打开的文件</Typography>
        <Typography variant="h5">
          在终端中使用 <code>nano FILENAME</code>
          <br />
          即可打开文件
        </Typography>
      </span>
    </div>
  );
}
