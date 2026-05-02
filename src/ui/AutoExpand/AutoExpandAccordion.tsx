import React, { useContext, useState } from "react";
import Accordion from "@mui/material/Accordion";
import { AutoExpandContext } from "./AutoExpandContext";

export function AutoExpandAccordion({
  cacheKey,
  unmountOnExit,
  children,
}: {
  cacheKey: string;
  unmountOnExit: boolean;
  children: NonNullable<React.ReactNode>;
}) {
  const autoExpandContextValue = useContext(AutoExpandContext);
  const [expanded, setExpanded] = useState(autoExpandContextValue.data[cacheKey] ?? false);
  return (
    <Accordion
      expanded={expanded}
      disableGutters
      TransitionProps={{ unmountOnExit, timeout: 0 }}
      onChange={(__, expanded) => {
        setExpanded(expanded);
        autoExpandContextValue.set(cacheKey, expanded);
      }}
    >
      {children}
    </Accordion>
  );
}
