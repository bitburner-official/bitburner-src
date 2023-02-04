import { Box, Container, Typography } from "@mui/material";
import React, { useState } from "react";
import { GameOptionsSidebar } from "./GameOptionsSidebar";
import { GameplayPage } from "./GameplayPage";
import { InterfacePage } from "./InterfacePage";
import { MiscPage } from "./MiscPage";
import { NumericDisplayPage } from "./NumericDisplayOptions";
import { RemoteAPIPage } from "./RemoteAPIPage";
import { SystemPage } from "./SystemPage";

interface IProps {
  save: () => void;
  export: () => void;
  forceKill: () => void;
  softReset: () => void;
}
export type OptionsTabName = "System" | "Interface" | "Numeric Display" | "Gameplay" | "Misc" | "Remote API";
const tabs: Record<OptionsTabName, React.ReactNode> = {
  System: <SystemPage />,
  Interface: <InterfacePage />,
  "Numeric Display": <NumericDisplayPage />,
  Gameplay: <GameplayPage />,
  Misc: <MiscPage />,
  "Remote API": <RemoteAPIPage />,
};

export function GameOptionsRoot(props: IProps): React.ReactElement {
  const [currentTab, setCurrentTab] = useState<OptionsTabName>("System");

  return (
    <Container disableGutters maxWidth="lg" sx={{ mx: 0 }}>
      <Typography variant="h4">Options</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 1 }}>
        <GameOptionsSidebar
          tab={currentTab}
          setTab={setCurrentTab}
          save={props.save}
          export={props.export}
          forceKill={props.forceKill}
          softReset={props.softReset}
        />
        {tabs[currentTab]}
      </Box>
    </Container>
  );
}
