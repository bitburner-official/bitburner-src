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
        <Typography variant="h4">No open files</Typography>
        <Typography variant="h5">
          Use <code>nano FILENAME</code> in
          <br />
          the terminal to open files
        </Typography>
      </span>
    </div>
  );
}
