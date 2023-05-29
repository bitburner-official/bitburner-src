/**
 * React Component for the Multiplier buttons on the Hacknet page.
 * These buttons let the player control how many Nodes/Upgrades they're
 * purchasing when using the UI (x1, x5, x10, MAX)
 */
import React from "react";

import Button from "@mui/material/Button";

import { getRecordEntries } from "../../Types/Record";
import { PositiveInteger } from "../../types";
import { PurchaseMultipliers } from "../data/Constants";

interface IProps {
  selectedMultiplier: PositiveInteger | "MAX";
  setMultiplier: (mult: PositiveInteger | "MAX") => void;
}

export function MultiplierButtons({ selectedMultiplier, setMultiplier }: IProps): JSX.Element {
  return (
    <>
      {getRecordEntries<string, PositiveInteger | "MAX">(PurchaseMultipliers).map(([text, mult]) => (
        <Button key={text} onClick={() => setMultiplier(mult)} disabled={mult === selectedMultiplier}>
          {text}
        </Button>
      ))}
    </>
  );
}
