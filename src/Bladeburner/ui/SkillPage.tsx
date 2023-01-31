import React, { useState } from "react";
import { SkillList } from "./SkillList";
import { BladeburnerConstants } from "../data/Constants";
import { Bladeburner } from "../Bladeburner";
import { formatBigNumber } from "../../ui/nFormat";
import Typography from "@mui/material/Typography";
interface IProps {
  bladeburner: Bladeburner;
}

export function SkillPage(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];
  const mults = props.bladeburner.skillMultipliers;

  function valid(mult: number | undefined): boolean {
    return mult !== undefined && mult !== 1;
  }

  return (
    <>
      <Typography>
        <strong>Skill Points: {formatBigNumber(props.bladeburner.skillPoints, 3)}</strong>
      </Typography>
      <Typography>
        You will gain one skill point every {BladeburnerConstants.RanksPerSkillPoint} ranks.
        <br />
        Note that when upgrading a skill, the benefit for that skill is additive. However, the effects of different
        skills with each other is multiplicative.
      </Typography>
      {valid(mults["successChanceAll"]) && (
        <Typography>Total Success Chance: x{formatBigNumber(mults["successChanceAll"], 3)}</Typography>
      )}
      {valid(mults["successChanceStealth"]) && (
        <Typography>Stealth Success Chance: x{formatBigNumber(mults["successChanceStealth"], 3)}</Typography>
      )}
      {valid(mults["successChanceKill"]) && (
        <Typography>Retirement Success Chance: x{formatBigNumber(mults["successChanceKill"], 3)}</Typography>
      )}
      {valid(mults["successChanceContract"]) && (
        <Typography>Contract Success Chance: x{formatBigNumber(mults["successChanceContract"], 3)}</Typography>
      )}
      {valid(mults["successChanceOperation"]) && (
        <Typography>Operation Success Chance: x{formatBigNumber(mults["successChanceOperation"], 3)}</Typography>
      )}
      {valid(mults["successChanceEstimate"]) && (
        <Typography>Synthoid Data Estimate: x{formatBigNumber(mults["successChanceEstimate"], 3)}</Typography>
      )}
      {valid(mults["actionTime"]) && <Typography>Action Time: x{formatBigNumber(mults["actionTime"], 3)}</Typography>}
      {valid(mults["effHack"]) && <Typography>Hacking Skill: x{formatBigNumber(mults["effHack"], 3)}</Typography>}
      {valid(mults["effStr"]) && <Typography>Strength: x{formatBigNumber(mults["effStr"], 3)}</Typography>}
      {valid(mults["effDef"]) && <Typography>Defense: x{formatBigNumber(mults["effDef"], 3)}</Typography>}
      {valid(mults["effDex"]) && <Typography>Dexterity: x{formatBigNumber(mults["effDex"], 3)}</Typography>}
      {valid(mults["effAgi"]) && <Typography>Agility: x{formatBigNumber(mults["effAgi"], 3)}</Typography>}
      {valid(mults["effCha"]) && <Typography>Charisma: x{formatBigNumber(mults["effCha"], 3)}</Typography>}
      {valid(mults["effInt"]) && <Typography>Intelligence: x{formatBigNumber(mults["effInt"], 3)}</Typography>}
      {valid(mults["stamina"]) && <Typography>Stamina: x{formatBigNumber(mults["stamina"], 3)}</Typography>}
      {valid(mults["money"]) && <Typography>Contract Money: x{formatBigNumber(mults["money"], 3)}</Typography>}
      {valid(mults["expGain"]) && <Typography>Exp Gain: x{formatBigNumber(mults["expGain"], 3)}</Typography>}
      <SkillList bladeburner={props.bladeburner} onUpgrade={() => setRerender((old) => !old)} />
    </>
  );
}

/*




var multKeys = Object.keys(this.skillMultipliers);
for (var i = 0; i < multKeys.length; ++i) {
    var mult = this.skillMultipliers[multKeys[i]];
    if (mult && mult !== 1) {
        mult = formatNumber(mult, 3);
        switch(multKeys[i]) {

        }
    }
}
*/
