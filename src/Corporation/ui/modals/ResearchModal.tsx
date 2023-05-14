import React, { useState } from "react";
import { Modal } from "../../../ui/React/Modal";
import { IndustryResearchTrees } from "../../IndustryData";
import * as corpConstants from "../../data/Constants";
import { Division } from "../../Division";
import { Research } from "../../Actions";
import { Node } from "../../ResearchTree";
import { ResearchMap } from "../../ResearchMap";
import { Settings } from "../../../Settings/Settings";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import Collapse from "@mui/material/Collapse";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import CheckIcon from "@mui/icons-material/Check";

interface INodeProps {
  n: Node | null;
  division: Division;
}
function Upgrade({ n, division }: INodeProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  if (n === null) return <></>;
  const r = ResearchMap[n.researchName];
  let disabled = division.researchPoints < r.cost || n.researched;
  const parent = n.parent;
  if (parent !== null) {
    disabled = disabled || !parent.researched;
  }

  function research(): void {
    if (n === null || disabled) return;
    try {
      Research(division, n.researchName);
    } catch (err) {
      dialogBoxCreate(err + "");
      return;
    }

    dialogBoxCreate(
      `Researched ${n.researchName}. It may take a market cycle (~${corpConstants.secondsPerMarketCycle} seconds) before the effects of the Research apply.`,
    );
  }

  let color: "primary" | "info" = "primary";
  if (n.researched) {
    color = "info";
  }

  const wrapInTooltip = (ele: React.ReactElement): React.ReactElement => {
    return (
      <Tooltip
        title={
          <Typography>
            Research points: {r.cost}
            <br />
            {r.description}
          </Typography>
        }
      >
        {ele}
      </Tooltip>
    );
  };

  const but = (
    <Box>
      {wrapInTooltip(
        <span>
          <Button
            color={color}
            disabled={disabled && !n.researched}
            onClick={research}
            style={{ width: "100%", textAlign: "left", justifyContent: "unset" }}
          >
            {n.researched && <CheckIcon sx={{ mr: 1 }} />}
            {n.researchName}
          </Button>
        </span>,
      )}
    </Box>
  );

  if (n.children.length === 0) return but;

  return (
    <Box>
      <Box display="flex" sx={{ border: "1px solid " + Settings.theme.well }}>
        {wrapInTooltip(
          <span style={{ width: "100%" }}>
            <Button
              color={color}
              disabled={disabled && !n.researched}
              onClick={research}
              sx={{
                width: "100%",
                textAlign: "left",
                justifyContent: "unset",
                borderColor: Settings.theme.button,
              }}
            >
              {n.researched && <CheckIcon sx={{ mr: 1 }} />}
              {n.researchName}
            </Button>
          </span>,
        )}
        <Button
          onClick={() => setOpen((old) => !old)}
          sx={{ borderColor: Settings.theme.button, minWidth: "fit-content" }}
        >
          {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
        </Button>
      </Box>
      <Collapse in={open} unmountOnExit>
        <Box m={1}>
          {n.children.map((m) => (
            <Upgrade key={m.researchName} division={division} n={m} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

interface IProps {
  open: boolean;
  onClose: () => void;
  industry: Division;
}

// Create the Research Tree UI for this Industry
export function ResearchModal(props: IProps): React.ReactElement {
  const researchTree = IndustryResearchTrees[props.industry.type];
  if (researchTree === undefined) return <></>;

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Upgrade division={props.industry} n={researchTree.root} />
      <Typography sx={{ mt: 1 }}>
        Research points: {props.industry.researchPoints.toFixed(3)}
        <br />
        Multipliers from research:
        <br />* Advertising Multiplier: x{researchTree.getAdvertisingMultiplier()}
        <br />* Employee Charisma Multiplier: x{researchTree.getEmployeeChaMultiplier()}
        <br />* Employee Creativity Multiplier: x{researchTree.getEmployeeCreMultiplier()}
        <br />* Employee Efficiency Multiplier: x{researchTree.getEmployeeEffMultiplier()}
        <br />* Employee Intelligence Multiplier: x{researchTree.getEmployeeIntMultiplier()}
        <br />* Production Multiplier: x{researchTree.getProductionMultiplier()}
        <br />* Sales Multiplier: x{researchTree.getSalesMultiplier()}
        <br />* Scientific Research Multiplier: x{researchTree.getScientificResearchMultiplier()}
        <br />* Storage Multiplier: x{researchTree.getStorageMultiplier()}
      </Typography>
    </Modal>
  );
}
