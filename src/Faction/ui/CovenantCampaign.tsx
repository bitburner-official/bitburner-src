import Typography from "@mui/material/Typography";
import { Player } from "@player";
import React, { useState } from "react";
import { CovenantPurchasesRoot } from "../../PersonObjects/Sleeve/ui/CovenantPurchasesRoot";
import { Modal } from "../../ui/React/Modal";
import { Option } from "./Option";

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
          The research team does not want to reveal their goal at this moment. It's best to leave now and come back
          later.
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
