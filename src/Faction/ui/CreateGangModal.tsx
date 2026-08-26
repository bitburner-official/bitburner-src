import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { KEY } from "../../utils/KeyboardEventKey";
import { FactionName } from "@enums";
import { canCreateGang } from "../../Gang/helpers";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

interface IProps {
  open: boolean;
  onClose: () => void;
  facName: FactionName;
}

/** React Component for the popup used to create a new gang. */
export function CreateGangModal(props: IProps): React.ReactElement {
  const combatGangText =
    props.facName +
    " 是一支战斗型帮派，其成员的任务与黑客型帮派不同。" +
    "与黑客帮派相比，战斗帮派的推进可能更加困难，因为领地管理" +
    "更为重要。不过，经营得当的战斗帮派推进速度会比黑客帮派更快。";

  const hackingGangText =
    props.facName +
    " 是一支黑客型帮派，其成员的任务与战斗型帮派不同。" +
    "与战斗帮派相比，黑客帮派的推进较慢但更直接，因为领地争夺战" +
    "并没有那么重要。";

  function isHacking(): boolean {
    return [FactionName.NiteSec, FactionName.TheBlackHand].includes(props.facName);
  }

  function createGang(): void {
    const checkResult = canCreateGang(props.facName);
    if (!checkResult.success) {
      dialogBoxCreate(checkResult.message);
      return;
    }
    Player.startGang(props.facName, isHacking());
    props.onClose();
    Router.toPage(Page.Gang);
  }

  function onKeyUp(event: React.KeyboardEvent): void {
    if (event.key === KEY.ENTER) createGang();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        你想与 {props.facName} 创建一个新的帮派吗？
        <br />
        <br />
        在当前 BitNode 被摧毁或放弃之前，你将无法与其他任何派系创建帮派。 这还会重置你与 {props.facName} 的声望。
        <br />
        <br />
        {isHacking() ? hackingGangText : combatGangText}
        <br />
        <br />
        除了黑客型与战斗型的区别以及名称之外，各帮派之间没有其他差异。
      </Typography>
      <Button onClick={createGang} onKeyUp={onKeyUp} autoFocus>
        创建帮派
      </Button>
      <Button onClick={props.onClose}>取消</Button>
    </Modal>
  );
}
