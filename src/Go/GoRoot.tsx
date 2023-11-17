import { Container, Tab, Tabs } from "@mui/material";
import React from "react";
import { GoInstructionsPage } from "./ui/GoInstructionsPage";
import { BorderInnerSharp, Help, ManageSearch, History } from "@mui/icons-material";
import { GoStatusPage } from "./ui/GoStatusPage";
import { GoHistoryPage } from "./ui/GoHistoryPage";
import { GoGameboardWrapper } from "./ui/GoGameboardWrapper";
import { boardStyles } from "./boardState/goStyles";

export function GoRoot(): React.ReactElement {
  const classes = boardStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  function showInstructions() {
    setValue(3);
  }

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="IPvGO Subnet" icon={<BorderInnerSharp />} iconPosition={"start"} className={classes.tab} />
        <Tab label="Status" icon={<ManageSearch />} iconPosition={"start"} className={classes.tab} />
        <Tab label="History" icon={<History />} iconPosition={"start"} className={classes.tab} />
        <Tab label="How to Play" icon={<Help />} iconPosition={"start"} className={classes.tab} />
      </Tabs>
      {value === 0 && <GoGameboardWrapper showInstructions={showInstructions} />}
      {value === 1 && <GoStatusPage />}
      {value === 2 && <GoHistoryPage />}
      {value === 3 && <GoInstructionsPage />}
    </Container>
  );
}
