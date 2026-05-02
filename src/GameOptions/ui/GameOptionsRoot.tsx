import { Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GameOptionsSidebar } from "./GameOptionsSidebar";
import { GameplayPage } from "./GameplayPage";
import { InterfacePage } from "./InterfacePage";
import { MiscPage } from "./MiscPage";
import { NumericDisplayPage } from "./NumericDisplayOptions";
import { RemoteAPIPage } from "./RemoteAPIPage";
import { SystemPage } from "./SystemPage";
import { KeyBindingPage } from "./KeyBindingPage";
import { EventEmitter } from "../../utils/EventEmitter";

export type OptionsTabName =
  | "System"
  | "Interface"
  | "Numeric Display"
  | "Gameplay"
  | "Misc"
  | "Remote API"
  | "Key Binding";

interface IProps {
  tab?: OptionsTabName;
  save: () => void;
  export: () => void;
  forceKill: () => void;
  softReset: () => void;
  reactivateTutorial: () => void;
}

const tabs: Record<OptionsTabName, React.ReactNode> = {
  System: <SystemPage />,
  Interface: <InterfacePage />,
  "Numeric Display": <NumericDisplayPage />,
  Gameplay: <GameplayPage />,
  Misc: <MiscPage />,
  "Remote API": <RemoteAPIPage />,
  "Key Binding": <KeyBindingPage />,
};

export const GameOptionsPageEvents = new EventEmitter<[OptionsTabName]>();

export function GameOptionsRoot(props: IProps): React.ReactElement {
  const [currentTab, setCurrentTab] = useState<OptionsTabName>(props.tab ?? "System");

  useEffect(
    () =>
      GameOptionsPageEvents.subscribe((tab: OptionsTabName) => {
        setCurrentTab(tab);
      }),
    [],
  );

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
