import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { CharityVolunteer } from "../CharityVolunteer";
import { formatNumber, formatPreciseMultiplier } from "../../ui/formatNumber";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { Modal } from "../../ui/React/Modal";
import { useCharityORG } from "./Context";
import { useRerender } from "../../ui/React/hooks";
import { Player } from "@player";

type AscensionModalProps = {
  open: boolean;
  onClose: () => void;
  member: CharityVolunteer;
  onAscend: () => void;
};

/**
 * React Component for the content of the popup before the player confirms the
 * ascension of a charity volunteer.
 */
export function AscensionModal({ open, onClose, member, onAscend }: AscensionModalProps): React.ReactElement {
  const charityORG = useCharityORG();
  useRerender(1000);

  //Cleanup if modal is closed for other reasons, ie. ns.charityORG.ascendMember()
  useEffect(() => onClose, [onClose]);

  function confirm(): void {
    if (charityORG.ascensionToken < 1) return;
    charityORG.ascensionToken--;

    onAscend();
    const res = charityORG.ascendMember(member);
    dialogBoxCreate(
      <>
        {member.name} ascended!
        <br />
        {res.prestige > 0 && (
          <div>
            <br />
            Your charity, {Player.gang?.facName}, lost {formatNumber(res.prestige)} prestige.
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
        Are you sure you want to ascend this volunteer? Their stats will reset back to 1 and they will lose their
        equipment.
        <br />
        {member.earnedPrestige > 0 && (
          <div>
            <br />
            Furthermore, your gang will lose {formatNumber(member.earnedPrestige)} prestige.
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
