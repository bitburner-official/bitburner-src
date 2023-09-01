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
export function AscensionModal(props: AscensionModalProps): React.ReactElement {
  const gang = useGang();
  useRerender(1000);

  //Cleanup if modal is closed for other reasons, ie. ns.gang.ascendMember()
  useEffect(() => {
    return () => {
      props.onClose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // dependency array must be given and empty or modal will not open
  // React error wants 'props' in dependency or don't use 'props'.
  // See: https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook

  function confirm(): void {
    props.onAscend();
    const res = gang.ascendMember(props.member);
    dialogBoxCreate(
      <>
        {props.member.name} ascended!
        <br />
        <br />
        Your gang, {Player.gang?.facName}, lost {formatRespect(res.respect)} respect.
        <br />
        <br />
        {props.member.name} gained the following stat multipliers for ascending:
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
    props.onClose();
  }

  // const ascendBenefits = props.member.getAscensionResults();
  const preAscend = props.member.getCurrentAscensionMults();
  const postAscend = props.member.getAscensionMultsAfterAscend();

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        Are you sure you want to ascend this member? They will lose all of
        <br />
        their non-Augmentation upgrades and their stats will reset back to 1.
        <br />
        <br />
        Furthermore, your gang will lose {formatRespect(props.member.earnedRespect)} respect.
        <br />
        <br />
        In return, {props.member.name} will gain the following permanent boost to stat multipliers:
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
      <Button onClick={props.onClose}>Cancel</Button>
    </Modal>
  );
}
