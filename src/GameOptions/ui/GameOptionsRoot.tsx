import { Box, Container, Typography } from "@mui/material";
import React, { useState } from "react";
import { GameOptionsSidebar } from "./GameOptionsSidebar";
import { GameplayPage } from "./GameplayPage";
import { InterfacePage } from "./InterfacePage";
import { MiscPage } from "./MiscPage";
import { NumericDisplayPage } from "./NumericDisplayOptions";
import { RemoteAPIPage } from "./RemoteAPIPage";
import { SystemPage } from "./SystemPage";
import { KeyBindingPage } from "./KeyBindingPage";

interface IProps {
  save: () => void;
  export: () => void;
  forceKill: () => void;
  softReset: () => void;
  reactivateTutorial: () => void;
}

export type OptionsTabName =
  | "System"
  | "Interface"
  | "Numeric Display"
  | "Gameplay"
  | "Misc"
  | "Remote API"
  | "Key Binding";

const tabs: Record<OptionsTabName, React.ReactNode> = {
  System: <SystemPage />,
  Interface: <InterfacePage />,
  "Numeric Display": <NumericDisplayPage />,
  Gameplay: <GameplayPage />,
  Misc: <MiscPage />,
  "Remote API": <RemoteAPIPage />,
  "Key Binding": <KeyBindingPage />,
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
          reactivateTutorial={props.reactivateTutorial}
        />
        {tabs[currentTab]}
      </Box>
    </Container>
  );
}
