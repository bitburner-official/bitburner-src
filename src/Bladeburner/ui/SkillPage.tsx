import React, { useState } from "react";
import { SkillList } from "./SkillList";
import { BladeburnerConstants } from "../data/Constants";
import { numeralWrapper } from "../../ui/numeralFormat";
import { Bladeburner } from "../Bladeburner";
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
        <strong>Skill Points: {numeralWrapper.formatBBNumber(props.bladeburner.skillPoints, 0)}</strong>
      </Typography>
      <Typography>
        You will gain one skill point every {BladeburnerConstants.RanksPerSkillPoint} ranks.
        <br />
        Note that when upgrading a skill, the benefit for that skill is additive. However, the effects of different
        skills with each other is multiplicative.
      </Typography>
      {valid(mults["successChanceAll"]) && (
        <Typography>Total Success Chance: x{numeralWrapper.formatBBNumber(mults["successChanceAll"], 3)}</Typography>
      )}
      {valid(mults["successChanceStealth"]) && (
        <Typography>
          Stealth Success Chance: x{numeralWrapper.formatBBNumber(mults["successChanceStealth"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceKill"]) && (
        <Typography>
          Retirement Success Chance: x{numeralWrapper.formatBBNumber(mults["successChanceKill"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceContract"]) && (
        <Typography>
          Contract Success Chance: x{numeralWrapper.formatBBNumber(mults["successChanceContract"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceOperation"]) && (
        <Typography>
          Operation Success Chance: x{numeralWrapper.formatBBNumber(mults["successChanceOperation"], 3)}
        </Typography>
      )}
      {valid(mults["successChanceEstimate"]) && (
        <Typography>
          Synthoid Data Estimate: x{numeralWrapper.formatBBNumber(mults["successChanceEstimate"], 3)}
        </Typography>
      )}
      {valid(mults["actionTime"]) && (
        <Typography>Action Time: x{numeralWrapper.formatBBNumber(mults["actionTime"], 3)}</Typography>
      )}
      {valid(mults["effHack"]) && (
        <Typography>Hacking Skill: x{numeralWrapper.formatBBNumber(mults["effHack"], 3)}</Typography>
      )}
      {valid(mults["effStr"]) && (
        <Typography>Strength: x{numeralWrapper.formatBBNumber(mults["effStr"], 3)}</Typography>
      )}
      {valid(mults["effDef"]) && <Typography>Defense: x{numeralWrapper.formatBBNumber(mults["effDef"], 3)}</Typography>}
      {valid(mults["effDex"]) && (
        <Typography>Dexterity: x{numeralWrapper.formatBBNumber(mults["effDex"], 3)}</Typography>
      )}
      {valid(mults["effAgi"]) && <Typography>Agility: x{numeralWrapper.formatBBNumber(mults["effAgi"], 3)}</Typography>}
      {valid(mults["effCha"]) && (
        <Typography>Charisma: x{numeralWrapper.formatBBNumber(mults["effCha"], 3)}</Typography>
      )}
      {valid(mults["effInt"]) && (
        <Typography>Intelligence: x{numeralWrapper.formatBBNumber(mults["effInt"], 3)}</Typography>
      )}
      {valid(mults["stamina"]) && (
        <Typography>Stamina: x{numeralWrapper.formatBBNumber(mults["stamina"], 3)}</Typography>
      )}
      {valid(mults["money"]) && (
        <Typography>Contract Money: x{numeralWrapper.formatBBNumber(mults["money"], 3)}</Typography>
      )}
      {valid(mults["expGain"]) && (
        <Typography>Exp Gain: x{numeralWrapper.formatBBNumber(mults["expGain"], 3)}</Typography>
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
