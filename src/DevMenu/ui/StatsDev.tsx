import React from "react";

import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import { Adjuster } from "./Adjuster";
import { Player } from "@player";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { calculateExp } from "../../PersonObjects/formulas/skill";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

const bigNumber = 1e27;

function modifyExp(stat: string, modifier: number) {
  return function (exp: number) {
    if (!Number.isFinite(exp) || exp < 0) {
      dialogBoxCreate(`Exp cannot be ${exp}.`);
      return;
    }
    switch (stat) {
      case "Hacking":
        Player.gainHackingExp(exp * modifier);
        break;
      case "Strength":
        Player.gainStrengthExp(exp * modifier);
        break;
      case "Defense":
        Player.gainDefenseExp(exp * modifier);
        break;
      case "Dexterity":
        Player.gainDexterityExp(exp * modifier);
        break;
      case "Agility":
        Player.gainAgilityExp(exp * modifier);
        break;
      case "Charisma":
        Player.gainCharismaExp(exp * modifier);
        break;
      case "Intelligence":
        Player.gainIntelligenceExp(exp * modifier);
        break;
    }
    Player.updateSkillLevels();
  };
}

function setStatLevel(stat: string, level: number): void {
  if (!Number.isFinite(level) || level < 1) {
    dialogBoxCreate(`Invalid level.`);
    return;
  }
  switch (stat) {
    case "Hacking":
      Player.exp.hacking = calculateExp(level, Player.mults.hacking * currentNodeMults.HackingLevelMultiplier);
      break;
    case "Strength":
      Player.exp.strength = calculateExp(level, Player.mults.strength * currentNodeMults.StrengthLevelMultiplier);
      break;
    case "Defense":
      Player.exp.defense = calculateExp(level, Player.mults.defense * currentNodeMults.DefenseLevelMultiplier);
      break;
    case "Dexterity":
      Player.exp.dexterity = calculateExp(level, Player.mults.dexterity * currentNodeMults.DexterityLevelMultiplier);
      break;
    case "Agility":
      Player.exp.agility = calculateExp(level, Player.mults.agility * currentNodeMults.AgilityLevelMultiplier);
      break;
    case "Charisma":
      Player.exp.charisma = calculateExp(level, Player.mults.charisma * currentNodeMults.CharismaLevelMultiplier);
      break;
    case "Intelligence":
      Player.exp.intelligence = 0;
      Player.gainIntelligenceExp(calculateExp(level, 1));
      break;
  }
  Player.updateSkillLevels();
}

function modifyKarma(modifier: number) {
  return function (amt: number) {
    Player.karma += amt * modifier;
  };
}

function tonsOfExp(): void {
  Player.gainHackingExp(bigNumber);
  Player.gainStrengthExp(bigNumber);
  Player.gainDefenseExp(bigNumber);
  Player.gainDexterityExp(bigNumber);
  Player.gainAgilityExp(bigNumber);
  Player.gainCharismaExp(bigNumber);
  Player.gainIntelligenceExp(bigNumber);
  Player.updateSkillLevels();
}

function resetAllExp(): void {
  Player.exp.hacking = 0;
  Player.exp.strength = 0;
  Player.exp.defense = 0;
  Player.exp.dexterity = 0;
  Player.exp.agility = 0;
  Player.exp.charisma = 0;
  Player.exp.intelligence = 0;
  Player.updateSkillLevels();
}

function resetExperience(stat: string): () => void {
  return function () {
    switch (stat) {
      case "Hacking":
        Player.exp.hacking = 0;
        break;
      case "Strength":
        Player.exp.strength = 0;
        break;
      case "Defense":
        Player.exp.defense = 0;
        break;
      case "Dexterity":
        Player.exp.dexterity = 0;
        break;
      case "Agility":
        Player.exp.agility = 0;
        break;
      case "Charisma":
        Player.exp.charisma = 0;
        break;
      case "Intelligence":
        Player.exp.intelligence = 0;
        break;
    }
    Player.updateSkillLevels();
  };
}

function resetKarma(): () => void {
  return function () {
    Player.karma = 0;
  };
}

function enableIntelligence(): void {
  if (Player.skills.intelligence === 0) {
    Player.skills.intelligence = 1;
    Player.updateSkillLevels();
  }
}

function disableIntelligence(): void {
  Player.exp.intelligence = 0;
  Player.skills.intelligence = 0;
  Player.updateSkillLevels();
}

function StatRow({ stat }: { stat: string }): React.ReactElement {
  const [level, setLevel] = React.useState<number | string>("");

  return (
    <tr>
      <td>
        <Typography>{stat}:</Typography>
      </td>
      <td>
        <Adjuster
          label={"exp"}
          placeholder={"exp"}
          tons={() => modifyExp(stat, 1)(bigNumber)}
          add={modifyExp(stat, 1)}
          subtract={modifyExp(stat, -1)}
          reset={resetExperience(stat)}
        />
      </td>
      <td>
        <TextField
          label={"Level"}
          value={level}
          onChange={(event) => {
            if (event.target.value === "") {
              setLevel("");
              return;
            }
            setLevel(Number.parseFloat(event.target.value));
          }}
          placeholder={"Level"}
          type="number"
          InputProps={{
            // Without startAdornment, label and placeholder are only shown when TextField is focused
            startAdornment: <></>,
            endAdornment: (
              <Button onClick={() => setStatLevel(stat, typeof level !== "string" ? level : 0)}>Set</Button>
            ),
          }}
          style={{ marginLeft: "20px" }}
        />
      </td>
      {stat === "Intelligence" && (
        <>
          <td>
            <Button onClick={enableIntelligence} style={{ marginTop: "15px" }}>
              Enable
            </Button>
          </td>
          <td>
            <Button onClick={disableIntelligence} style={{ marginTop: "15px" }}>
              Disable
            </Button>
          </td>
        </>
      )}
    </tr>
  );
}

export function StatsDev(): React.ReactElement {
  const [levelOfNormalStats, setLevelOfNormalStats] = React.useState<number | string>("");

  return (
    <AutoExpandAccordion cacheKey="DEVMENU_StatsDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Experience / Stats</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>All:</Typography>
              </td>
              <td>
                <Button onClick={tonsOfExp}>Tons of exp</Button>
                <Button onClick={resetAllExp}>Reset</Button>
              </td>
              <td>
                <TextField
                  label={"Level"}
                  value={levelOfNormalStats}
                  onChange={(event) => {
                    if (event.target.value === "") {
                      setLevelOfNormalStats("");
                      return;
                    }
                    setLevelOfNormalStats(Number.parseFloat(event.target.value));
                  }}
                  placeholder={"Level"}
                  type="number"
                  InputProps={{
                    // Without startAdornment, label and placeholder are only shown when TextField is focused
                    startAdornment: <></>,
                    endAdornment: (
                      <Tooltip title="Set all, except Intelligence and Karma">
                        <Button
                          onClick={() => {
                            const level = typeof levelOfNormalStats !== "string" ? levelOfNormalStats : 0;
                            setStatLevel("Hacking", level);
                            setStatLevel("Strength", level);
                            setStatLevel("Defense", level);
                            setStatLevel("Dexterity", level);
                            setStatLevel("Agility", level);
                            setStatLevel("Charisma", level);
                          }}
                          style={{ width: "100px" }}
                        >
                          Set all
                        </Button>
                      </Tooltip>
                    ),
                  }}
                  style={{ marginLeft: "20px", width: "300px" }}
                />
              </td>
            </tr>
            {["Hacking", "Strength", "Defense", "Dexterity", "Agility", "Charisma", "Intelligence"].map((value) => (
              <StatRow key={value} stat={value} />
            ))}
            <tr>
              <td>
                <Typography>Karma:</Typography>
              </td>
              <td>
                <Adjuster
                  label="karma"
                  placeholder="amt"
                  tons={() => modifyKarma(1)(-54000)}
                  add={modifyKarma(1)}
                  subtract={modifyKarma(-1)}
                  reset={resetKarma()}
                  useDownArrowIcon={true}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
