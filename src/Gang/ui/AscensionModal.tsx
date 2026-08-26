import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { GangMember } from "../GangMember";
import { formatPreciseMultiplier, formatRespect } from "../../ui/formatNumber";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { Modal } from "../../ui/React/Modal";
import { useGang } from "./Context";
import { useRerender } from "../../ui/React/hooks";
import { Player } from "@player";

type AscensionModalProps = {
  open: boolean;
  onClose: () => void;
  member: GangMember;
  onAscend: () => void;
};

/**
 * React Component for the content of the popup before the player confirms the
 * ascension of a gang member.
 */
export function AscensionModal({ open, onClose, member, onAscend }: AscensionModalProps): React.ReactElement {
  const gang = useGang();
  useRerender(1000);

  //Cleanup if modal is closed for other reasons, ie. ns.gang.ascendMember()
  useEffect(() => onClose, [onClose]);

  function confirm(): void {
    onAscend();
    const res = gang.ascendMember(member);
    dialogBoxCreate(
      <>
        {member.name} 飞升了！
        <br />
        {res.respect > 0 && (
          <div>
            <br />
            你的帮派（{Player.gang?.facName}）失去了 {formatRespect(res.respect)} 尊重。
            <br />
          </div>
        )}
        <br />
        {member.name} 因飞升获得了以下属性倍率：
        <br />
        <br />
        黑客：x{formatPreciseMultiplier(res.hack)}
        <br />
        力量：x{formatPreciseMultiplier(res.str)}
        <br />
        防御：x{formatPreciseMultiplier(res.def)}
        <br />
        灵巧：x{formatPreciseMultiplier(res.dex)}
        <br />
        敏捷：x{formatPreciseMultiplier(res.agi)}
        <br />
        魅力：x{formatPreciseMultiplier(res.cha)}
        <br />
      </>,
    );
    onClose();
  }

  // const ascendBenefits = props.member.getAscensionResults();
  const preAscend = member.getCurrentAscensionMults();
  const postAscend = member.getAscensionMultsAfterAscend();

  return (
    <Modal open={open} onClose={onClose}>
      <Typography>
        你确定要飞升这名成员吗？飞升后，该成员将失去
        <br />
        所有非强化类升级，且其属性会重置回 1。
        <br />
        {member.earnedRespect > 0 && (
          <div>
            <br />
            此外，你的帮派将失去 {formatRespect(member.earnedRespect)} 尊重。
            <br />
          </div>
        )}
        <br />
        作为回报，{member.name} 将获得以下永久的属性倍率提升：
        <br />
        <br />
        黑客：x{formatPreciseMultiplier(preAscend.hack)} =&gt; x{formatPreciseMultiplier(postAscend.hack)}
        <br />
        力量：x{formatPreciseMultiplier(preAscend.str)} =&gt; x{formatPreciseMultiplier(postAscend.str)}
        <br />
        防御：x{formatPreciseMultiplier(preAscend.def)} =&gt; x{formatPreciseMultiplier(postAscend.def)}
        <br />
        灵巧：x{formatPreciseMultiplier(preAscend.dex)} =&gt; x{formatPreciseMultiplier(postAscend.dex)}
        <br />
        敏捷：x{formatPreciseMultiplier(preAscend.agi)} =&gt; x{formatPreciseMultiplier(postAscend.agi)}
        <br />
        魅力：x{formatPreciseMultiplier(preAscend.cha)} =&gt; x{formatPreciseMultiplier(postAscend.cha)}
        <br />
        <br />
      </Typography>
      <Button onClick={confirm}>飞升</Button>
      <Button onClick={onClose}>取消</Button>
    </Modal>
  );
}
