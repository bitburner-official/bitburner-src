import React from "react";

import { Tooltip } from "@mui/material";

import ThumbUpAlt from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAlt from "@mui/icons-material/ThumbDownAlt";

export const ComparisonIcon = ({ isBetter }: { isBetter: boolean }): JSX.Element => {
  const title = isBetter ? "Imported value is larger!" : "Imported value is smaller!";
  const icon = isBetter ? <ThumbUpAlt color="success" /> : <ThumbDownAlt color="error" />;

  return <Tooltip title={title}>{icon}</Tooltip>;
};
