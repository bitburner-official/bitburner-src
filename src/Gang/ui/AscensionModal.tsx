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
        {member.name} ascended!
        <br />
        {res.respect > 0 && (
          <div>
            <br />
            Your gang, {Player.gang?.facName}, lost {formatRespect(res.respect)} respect.
            <br />
          </div>
        )}
        <br />
        {member.name} gained the following stat multipliers for ascending:
        <br />
        <br />
        Hacking: x{formatPreciseMultiplier(res.hack)}
        <br />
        Strength: x{formatPreciseMultiplier(res.str)}
        <br />
        Defense: x{formatPreciseMultiplier(res.def)}
        <br />
        Dexterity: x{formatPreciseMultiplier(res.dex)}
        <br />
        Agility: x{formatPreciseMultiplier(res.agi)}
        <br />
        Charisma: x{formatPreciseMultiplier(res.cha)}
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
        Are you sure you want to ascend this member? They will lose all of
        <br />
        their non-Augmentation upgrades and their stats will reset back to 1.
        <br />
        {member.earnedRespect > 0 && (
          <div>
            <br />
            Furthermore, your gang will lose {formatRespect(member.earnedRespect)} respect.
            <br />
          </div>
        )}
        <br />
        In return, {member.name} will gain the following permanent boost to stat multipliers:
        <br />
        <br />
        Hacking: x{formatPreciseMultiplier(preAscend.hack)} =&gt; x{formatPreciseMultiplier(postAscend.hack)}
        <br />
        Strength: x{formatPreciseMultiplier(preAscend.str)} =&gt; x{formatPreciseMultiplier(postAscend.str)}
        <br />
        Defense: x{formatPreciseMultiplier(preAscend.def)} =&gt; x{formatPreciseMultiplier(postAscend.def)}
        <br />
        Dexterity: x{formatPreciseMultiplier(preAscend.dex)} =&gt; x{formatPreciseMultiplier(postAscend.dex)}
        <br />
        Agility: x{formatPreciseMultiplier(preAscend.agi)} =&gt; x{formatPreciseMultiplier(postAscend.agi)}
        <br />
        Charisma: x{formatPreciseMultiplier(preAscend.cha)} =&gt; x{formatPreciseMultiplier(postAscend.cha)}
        <br />
        <br />
      </Typography>
      <Button onClick={confirm}>Ascend</Button>
      <Button onClick={onClose}>Cancel</Button>
    </Modal>
  );
}
