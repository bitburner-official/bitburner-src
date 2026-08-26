import React, { useState } from "react";

import { Money } from "../../../ui/React/Money";
import { Modal } from "../../../ui/React/Modal";
import { Router } from "../../../ui/GameRoot";
import { Page } from "../../../ui/Router";
import { formatShares } from "../../../ui/formatNumber";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../../ui/Components/ButtonWithTooltip";
import TextField from "@mui/material/TextField";
import { createCorporation } from "../../Actions";
import { costOfCreatingCorporation } from "../../helpers";
import { exceptionAlert } from "../../../utils/helpers/exceptionAlert";

interface IProps {
  open: boolean;
  onClose: () => void;
  restart: boolean;
}

export function CreateCorporationModal(props: IProps): React.ReactElement {
  const cost = costOfCreatingCorporation(props.restart);
  const canSelfFund = Player.canAfford(cost);
  const [name, setName] = useState("");

  if (!Player.canAccessCorporation() || (Player.corporation && !props.restart)) {
    return <></>;
  }

  const disabledTextForNoName = name === "" ? "请输入企业名称" : "";

  function onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
  }

  function createCorporationWithUI(corporationName: string, selfFund: boolean): void {
    const result = createCorporation(corporationName, selfFund, props.restart);
    if (!result.success) {
      /**
       * This should not happen. We always check if the player can create a corporation before enabling UI elements
       * needed to do that.
       */
      exceptionAlert(new Error(result.message));
      return;
    }
    props.onClose();
    Router.toPage(Page.Corporation);
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        {!props.restart ? (
          <>
            要创办一家企业吗？这需要 <Money money={cost} forPurchase={true} /> 作为注册费用和启动资金。{" "}
            {Player.bitNodeN === 3 && (
              <>
                这笔 <Money money={cost} /> 资金既可以自筹，也可以从政府获得种子资金，但需要交换 {formatShares(500e6)}{" "}
                股股份（占公司 <b>33.3%</b> 的股权）。
              </>
            )}
          </>
        ) : (
          <>
            要出售你的CEO职位并创办一家新企业吗？当前企业的一切都将不复存在，你将重新开始。
          </>
        )}
        <br />
        <br />
        如果你想创办{props.restart ? "新的" : ""}企业，请在下方输入你的企业名称：
      </Typography>
      <br />
      <TextField autoFocus={true} placeholder="企业名称" onChange={onChange} value={name} />
      {Player.bitNodeN === 3 && (
        <ButtonWithTooltip onClick={() => createCorporationWithUI(name, false)} disabledTooltip={disabledTextForNoName}>
          使用种子资金
        </ButtonWithTooltip>
      )}
      <ButtonWithTooltip
        onClick={() => createCorporationWithUI(name, true)}
        disabledTooltip={disabledTextForNoName || (canSelfFund ? "" : "玩家资金不足")}
      >
        自筹资金（<Money money={cost} forPurchase={true} />）
      </ButtonWithTooltip>
    </Modal>
  );
}
