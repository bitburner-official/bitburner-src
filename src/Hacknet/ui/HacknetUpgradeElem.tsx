import React, { useState } from "react";

import { purchaseHashUpgrade } from "../HacknetHelpers";
import { HashManager } from "../HashManager";
import { HashUpgrade } from "../HashUpgrade";

import { ServerDropdown, ServerType } from "../../ui/React/ServerDropdown";
import { CompanyDropdown } from "../../ui/React/CompanyDropdown";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { CopyableText } from "../../ui/React/CopyableText";
import { Hashes } from "../../ui/React/Hashes";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { SelectChangeEvent } from "@mui/material/Select";
import { FactionNames } from "../../Faction/data/FactionNames";
import { companiesMetadata } from "../../Company/data/CompaniesMetadata";

interface IProps {
  hashManager: HashManager;
  upg: HashUpgrade;
  rerender: () => void;
}

const serversMap: { [key: string]: string } = {};
const companiesMap: { [key: string]: string } = {};

export function HacknetUpgradeElem(props: IProps): React.ReactElement {
  const [selectedServer, setSelectedServer] = useState(
    serversMap[props.upg.name] ? serversMap[props.upg.name] : FactionNames.ECorp.toLowerCase(),
  );
  function changeTargetServer(event: SelectChangeEvent<string>): void {
    setSelectedServer(event.target.value);
    serversMap[props.upg.name] = event.target.value;
  }
  const [selectedCompany, setSelectedCompany] = useState(
    companiesMap[props.upg.name] ? companiesMap[props.upg.name] : companiesMetadata[0].name,
  );
  function changeTargetCompany(event: SelectChangeEvent<string>): void {
    setSelectedCompany(event.target.value);
    companiesMap[props.upg.name] = event.target.value;
  }
  function purchase(): void {
    const canPurchase = props.hashManager.hashes >= props.hashManager.getUpgradeCost(props.upg.name);
    if (canPurchase) {
      const res = purchaseHashUpgrade(props.upg.name, props.upg.name === "Company Favor" ? selectedCompany : selectedServer);
      if (!res) {
        dialogBoxCreate(
          "Failed to purchase upgrade. This may be because you do not have enough hashes, " +
            "or because you do not have access to the feature upgrade affects.",
        );
      }
      props.rerender();
    }
  }

  const hashManager = props.hashManager;
  const upg = props.upg;
  const cost = hashManager.getUpgradeCost(upg.name);
  const level = hashManager.upgrades[upg.name];
  const effect = upg.effectText(level);

  // Purchase button
  const canPurchase = hashManager.hashes >= cost;

  // We'll reuse a Bladeburner css class
  return (
    <Paper sx={{ p: 1 }}>
      <Typography>
        <CopyableText value={upg.name} />
      </Typography>
      <Typography>
        Cost: <Hashes hashes={cost} />, Bought: {level} times
      </Typography>

      <Typography>{upg.desc}</Typography>
      {!upg.hasTargetServer && !upg.hasTargetCompany && (
        <Button onClick={purchase} disabled={!canPurchase}>
          Buy
        </Button>
      )}
      {upg.hasTargetServer && (
        <ServerDropdown
          purchase={purchase}
          canPurchase={canPurchase}
          value={selectedServer}
          serverType={ServerType.Foreign}
          onChange={changeTargetServer}
        />
      )}
      {upg.hasTargetCompany && (
        <CompanyDropdown
          purchase={purchase}
          canPurchase={canPurchase}
          value={selectedCompany}
          onChange={changeTargetCompany}
        />
      )}
      {level > 0 && effect && <Typography>{effect}</Typography>}
    </Paper>
  );
}
