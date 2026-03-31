import Typography from "@mui/material/Typography";
import { Player } from "@player";
import React, { useState } from "react";
import { CovenantPurchasesRoot } from "../../PersonObjects/Sleeve/ui/CovenantPurchasesRoot";
import { Modal } from "../../ui/React/Modal";
import { Option } from "./Option";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";

function CovenantIncompleteCampaign() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Option
        buttonText={"Research"}
        infoText={"The Beginning of True Immortality"}
        onClick={() => setOpen(true)}
      ></Option>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Typography component="div">
          You tried your best to help the research team, but this research isn't making any progress.
          <br />
          <br />
          {knowAboutBitverse() ? (
            "Maybe this research can only be completed in BitNode 10?"
          ) : (
            <>
              Research data is always randomly corrupted for unknown reasons, and a weird message is sent to you every
              time it happens:
              <br />
              <br />
              #@)($*&@__Y0U__^%$#@&*()__HAV3__(&@#*$%(@
              <br />
              ()@#*$%(__N0T__@&$#)@*(__S33N__)(*@#&$)(
              <br />
              @&*($#@&__TH3__#@A&#@*)(@$#@)*
              <br />
              %$#@&()@__TRU1H__()*@#$&()@#$
            </>
          )}
        </Typography>
      </Modal>
    </>
  );
}

export function CovenantCampaign() {
  const [open, setOpen] = useState(false);

  if (Player.bitNodeN !== 10) {
    return <CovenantIncompleteCampaign />;
  }

  return (
    <>
      <Option
        buttonText={"Purchase & Upgrade Duplicate Sleeves"}
        infoText={"Purchase Duplicate Sleeves and upgrades. These are permanent!"}
        onClick={() => setOpen(true)}
      ></Option>
      <CovenantPurchasesRoot open={open} onClose={() => setOpen(false)} />
    </>
  );
}
