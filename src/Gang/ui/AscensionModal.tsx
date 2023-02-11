/**
 * React Component for the content of the popup before the player confirms the
 * ascension of a gang member.
 */
import React, { useState, useEffect } from "react";
import { GangMember } from "../GangMember";
import { formatPreciseMultiplier, formatRespect } from "../../ui/formatNumber";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { Modal } from "../../ui/React/Modal";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface IProps {
  open: boolean;
  onClose: () => void;
  member: GangMember;
  onAscend: () => void;
}

export function AscensionModal(props: IProps): React.ReactElement {
  const gang = useGang();
  const setRerender = useState(false)[1];

  useEffect(() => {
    const id = setInterval(() => setRerender((old) => !old), 1000);
    return () => clearInterval(id);
  }, []);

  function confirm(): void {
    props.onAscend();
    const res = gang.ascendMember(props.member);
    dialogBoxCreate(
      <>
        You ascended {props.member.name}!<br />
        <br />
        Your gang lost {formatRespect(res.respect)} respect.
        <br />
        <br />
        {props.member.name} gained the following stat multipliers for ascending:
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
        Furthermore, your gang will lose {formatRespect(props.member.earnedRespect)} respect
        <br />
        <br />
        In return, they will gain the following permanent boost to stat multipliers:
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
      </Typography>
      <Button onClick={confirm}>Ascend</Button>
    </Modal>
  );
}
