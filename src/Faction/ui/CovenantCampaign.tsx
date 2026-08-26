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
      <Option buttonText={"研究"} infoText={"真正永生的开端"} onClick={() => setOpen(true)}></Option>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Typography component="div">
          你竭尽全力帮助研究团队，但这项研究毫无进展。
          <br />
          <br />
          {knowAboutBitverse() ? (
            "也许这项研究只能在 BitNode 10 中完成？"
          ) : (
            <>
              研究数据总是因未知原因而随机损坏，每次发生时都会有一条奇怪的讯息发送给你：
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
        buttonText={"购买与升级复制分身"}
        infoText={"购买复制分身及其升级。这些是永久的！"}
        onClick={() => setOpen(true)}
      ></Option>
      <CovenantPurchasesRoot open={open} onClose={() => setOpen(false)} />
    </>
  );
}
