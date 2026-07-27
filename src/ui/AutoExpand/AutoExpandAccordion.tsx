import React, { useContext, useState } from "react";
import Accordion from "@mui/material/Accordion";
import { AutoExpandContext } from "./AutoExpandContext";

export function AutoExpandAccordion({
  cacheKey,
  unmountOnExit,
  children,
  disabled,
}: {
  cacheKey: string;
  unmountOnExit: boolean;
  children: NonNullable<React.ReactNode>;
  disabled?: boolean;
}) {
  const autoExpandContextValue = useContext(AutoExpandContext);
  const [expanded, setExpanded] = useState(autoExpandContextValue.data[cacheKey] ?? false);
  return (
    <Accordion
      expanded={expanded}
      disableGutters
      TransitionProps={{ unmountOnExit, timeout: 0 }}
      disabled={disabled}
      onChange={(__, expanded) => {
        setExpanded(expanded);
        autoExpandContextValue.set(cacheKey, expanded);
      }}
    >
      {children}
    </Accordion>
  );
}
