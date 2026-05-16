import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Player } from "@player";
import React, { useState } from "react";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";
import { GangConstants } from "../../Gang/data/Constants";
import { Router } from "../../ui/GameRoot";
import { Modal } from "../../ui/React/Modal";
import { Page } from "../../ui/Router";
import { FactionName } from "../Enums";
import { CreateGangModal } from "./CreateGangModal";
import { Option } from "./Option";

function GangIncompleteCampaign() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Option
        buttonText={"Execute the formation plan"}
        infoText={
          "The tension between our faction and its rivals has been rising. The leader plans to form a specialized " +
          "group under your command to strengthen our position by improving our standing and expanding our resources."
        }
        onClick={() => setOpen(true)}
      ></Option>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Typography component="div">
          Each time you attempt to execute the plan, it is abruptly interrupted for reasons no one can explain. You
          receive the same distorted message every time:
          <br />
          <br />
          #@)($*&@__Y0U__^%$#@&*()__HAV3__(&@#*$%(@
          <br />
          ()@#*$%(__N0T__@&$#)@*(__S33N__)(*@#&$)(
          <br />
          @&*($#@&__TH3__#@A&#@*)(@$#@)*
          <br />
          %$#@&()@__TRU1H__()*@#$&()@#$
        </Typography>
      </Modal>
    </>
  );
}

export function GangCampaign({ factionName }: { factionName: FactionName }) {
  const [gangOpen, setGangOpen] = useState(false);

  if (!GangConstants.Names.includes(factionName)) {
    throw new Error(`Cannot create gang with ${factionName}`);
  }
  if (!knowAboutBitverse()) {
    return <GangIncompleteCampaign />;
  }

  const data = {
    enabled: false,
    title: "",
    tooltip: "" as string | React.ReactElement,
    description: "",
  };

  if (Player.gang) {
    if (Player.getGangName() !== factionName) {
      data.enabled = false;
      data.title = "Create Gang";
      data.tooltip = "You already created a gang with another faction";
    } else {
      data.enabled = true;
      data.title = "Manage Gang";
      data.description = "Manage a gang for this Faction. Gangs will earn you money and faction reputation";
    }
  } else {
    const checkResult = Player.canAccessGang();
    data.enabled = checkResult.success;
    data.title = "Create Gang";
    data.tooltip = !checkResult.success ? checkResult.message : "";
    data.description = "Create a gang for this Faction. Gangs will earn you money and faction reputation";
  }

  const manageGang = (): void => {
    // If player already has a gang, just go to the gang UI
    if (Player.inGang()) {
      return Router.toPage(Page.Gang);
    }

    setGangOpen(true);
  };

  return (
    <>
      <Box>
        <Paper sx={{ my: 1, p: 1 }}>
          <Tooltip title={data.tooltip}>
            <span>
              <Button onClick={manageGang} disabled={!data.enabled}>
                {data.title}
              </Button>
            </span>
          </Tooltip>
          <Typography>{data.description}</Typography>
        </Paper>
      </Box>

      <CreateGangModal facName={factionName} open={gangOpen} onClose={() => setGangOpen(false)} />
    </>
  );
}
