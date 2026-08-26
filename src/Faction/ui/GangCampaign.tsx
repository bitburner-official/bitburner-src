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
        buttonText={"执行组建计划"}
        infoText={
          "我们派系与竞争对手之间的紧张关系不断升级。首领计划在你麾下组建一支专门的" +
          "小队，通过提升我们的地位和扩充我们的资源来巩固势力。"
        }
        onClick={() => setOpen(true)}
      ></Option>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Typography component="div">
          每当你试图执行计划时，总会因无人能解释的原因被突然打断。你每次都会收到同样一条失真的讯息：
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
      data.title = "创建帮派";
      data.tooltip = "你已经在其他派系创建了帮派";
    } else {
      data.enabled = true;
      data.title = "管理帮派";
      data.description = "管理该派系的帮派。帮派会为你赚取资金和派系声望";
    }
  } else {
    const checkResult = Player.canAccessGang();
    data.enabled = checkResult.success;
    data.title = "创建帮派";
    data.tooltip = !checkResult.success ? checkResult.message : "";
    data.description = "为该派系创建一个帮派。帮派会为你赚取资金和派系声望";
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
