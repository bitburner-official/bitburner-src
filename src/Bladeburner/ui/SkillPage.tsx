import React, { useState } from "react";
import { SkillList } from "./SkillList";
import { BladeburnerConstants } from "../data/Constants";
import { Bladeburner } from "../Bladeburner";
import { numeralWrapper } from "../../ui/numeralFormat";
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
        <strong>Skill Points: {numeralWrapper.formatReallyBigNumber(props.bladeburner.skillPoints, 3)}</strong>
      </Typography>
      <Typography>
        You will gain one skill point every {BladeburnerConstants.RanksPerSkillPoint} ranks.
        <br />
        Note that when upgrading a skill, the benefit for that skill is additive. However, the effects of different
        skills with each other is multiplicative.
      </Typography>
      {valid(mults["successChanceAll"]) && (
        <Typography>
          Total Success Chance: x{numeralWrapper.formatReallyBigNumber(mults["successChanceAll"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceStealth"]) && (
        <Typography>
          Stealth Success Chance: x{numeralWrapper.formatReallyBigNumber(mults["successChanceStealth"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceKill"]) && (
        <Typography>
          Retirement Success Chance: x{numeralWrapper.formatReallyBigNumber(mults["successChanceKill"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceContract"]) && (
        <Typography>
          Contract Success Chance: x{numeralWrapper.formatReallyBigNumber(mults["successChanceContract"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceOperation"]) && (
        <Typography>
          Operation Success Chance: x{numeralWrapper.formatReallyBigNumber(mults["successChanceOperation"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceEstimate"]) && (
        <Typography>
          Synthoid Data Estimate: x{numeralWrapper.formatReallyBigNumber(mults["successChanceEstimate"], 3)}
        </Typography>
      )}
      {valid(mults["actionTime"]) && (
        <Typography>Action Time: x{numeralWrapper.formatReallyBigNumber(mults["actionTime"], 3)}</Typography>
      )}
      {valid(mults["effHack"]) && (
        <Typography>Hacking Skill: x{numeralWrapper.formatReallyBigNumber(mults["effHack"], 3)}</Typography>
      )}
      {valid(mults["effStr"]) && (
        <Typography>Strength: x{numeralWrapper.formatReallyBigNumber(mults["effStr"], 3)}</Typography>
      )}
      {valid(mults["effDef"]) && (
        <Typography>Defense: x{numeralWrapper.formatReallyBigNumber(mults["effDef"], 3)}</Typography>
      )}
      {valid(mults["effDex"]) && (
        <Typography>Dexterity: x{numeralWrapper.formatReallyBigNumber(mults["effDex"], 3)}</Typography>
      )}
      {valid(mults["effAgi"]) && (
        <Typography>Agility: x{numeralWrapper.formatReallyBigNumber(mults["effAgi"], 3)}</Typography>
      )}
      {valid(mults["effCha"]) && (
        <Typography>Charisma: x{numeralWrapper.formatReallyBigNumber(mults["effCha"], 3)}</Typography>
      )}
      {valid(mults["effInt"]) && (
        <Typography>Intelligence: x{numeralWrapper.formatReallyBigNumber(mults["effInt"], 3)}</Typography>
      )}
      {valid(mults["stamina"]) && (
        <Typography>Stamina: x{numeralWrapper.formatReallyBigNumber(mults["stamina"], 3)}</Typography>
      )}
      {valid(mults["money"]) && (
        <Typography>Contract Money: x{numeralWrapper.formatReallyBigNumber(mults["money"], 3)}</Typography>
      )}
      {valid(mults["expGain"]) && (
        <Typography>Exp Gain: x{numeralWrapper.formatReallyBigNumber(mults["expGain"], 3)}</Typography>
      )}
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
