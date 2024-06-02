import React from "react";
import { Container, IconButton, Typography } from "@mui/material";

import { myrian } from "../Myrian";
import { useRerender } from "../../ui/React/hooks";
import { Info } from "@mui/icons-material";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { MD } from "../../ui/MD/MD";
import { tutorial } from "./tutorial";
import { Grid } from "./Grid";

const tut = <MD md={tutorial} />;

export const MyrianRoot = (): React.ReactElement => {
  useRerender(50);

  const onHelp = () => dialogBoxCreate(tut);
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">
        Myrian OS
        <IconButton onClick={onHelp}>
          <Info />
        </IconButton>
      </Typography>
      <Typography>
        {myrian.vulns} vulns : {myrian.totalVulns} total vulns
      </Typography>
      <Grid />
    </Container>
  );
};
