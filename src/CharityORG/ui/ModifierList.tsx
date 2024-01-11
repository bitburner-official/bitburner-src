import * as React from "react";
import { CharityORG } from "../CharityORG";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { forEach } from "lodash";
import { formatNumber } from "../../ui/formatNumber";

interface IProps {
  charityORG: CharityORG;
}

/** React Component for displaying the bonus time remaining. */
export function ModifierList(props: IProps): React.ReactElement {
  if (props.charityORG.masterModifiers.length <= 0) return <></>;

  //if (modrecords.length === 0) return (<></>);
  return (
    <span>
      <Typography>Modifiers:</Typography>
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr" }}>
        {forEach(props.charityORG.masterModifiers).map((n, i) => (
          <Typography key={i}>
            {n.area.replace("_", " ")}: {formatNumber(n.strength)}%<br></br>
          </Typography>
        ))}
      </Box>
    </span>
  );
}
