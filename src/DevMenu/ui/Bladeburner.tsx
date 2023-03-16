import React, { useState } from "react";
import {
  Tooltip,
  Typography,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import { Adjuster } from "./Adjuster";
import { Player } from "@player";
import { CityName } from "../../Enums";
import { Skills as AllSkills } from "../../Bladeburner/Skills";
import { SkillNames } from "../../Bladeburner/data/SkillNames";

const bigNumber = 1e27;

export function Bladeburner(): React.ReactElement {
  if (!Player.bladeburner) return <></>;
  const bladeburner = Player.bladeburner;

  // Rank functions
  const modifyBladeburnerRank = (modify: number) => (rank: number) => bladeburner.changeRank(Player, rank * modify);
  const resetBladeburnerRank = () => {
    bladeburner.rank = 0;
    bladeburner.maxRank = 0;
  };
  const addTonsBladeburnerRank = () => bladeburner.changeRank(Player, bigNumber);

  // Skill point functions
  const modifyBladeburnerSP = (modify: number) => (skillPoints: number) => {
    bladeburner.skillPoints += skillPoints * modify;
  };
  const resetBladeburnerSP = () => {
    bladeburner.skillPoints = 0;
    bladeburner.totalSkillPoints = 0;
  };
  const addTonsBladeburnerSP = () => (bladeburner.skillPoints = bigNumber);

  // Cycles functions
  const modifyBladeburnerCycles = (modify: number) => (cycles: number) => (bladeburner.storedCycles += cycles * modify);
  const resetBladeburnerCycles = () => (bladeburner.storedCycles = 0);
  const addTonsBladeburnerCycles = () => (bladeburner.storedCycles += bigNumber);

  // Chaos functions
  const wipeAllChaos = () => Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos = 0));
  const wipeActiveCityChaos = () => (bladeburner.cities[bladeburner.city].chaos = 0);
  const addAllChaos = (modify: number) => (chaos: number) => {
    Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos += chaos * modify));
  };
  const addTonsAllChaos = () => {
    Object.values(CityName).forEach((city) => (bladeburner.cities[city].chaos += bigNumber));
  };

  // Skill functions
  const [skill, setSkill] = useState(SkillNames.BladesIntuition as string);
  function setSkillDropdown(event: SelectChangeEvent<string>): void {
    setSkill(event.target.value);
  }
  const modifySkill = (modifier: number) => (levelchange: number) => {
    if (bladeburner.skills[AllSkills[skill].name] == null) resetSkill();
    if (!isNaN(levelchange)) {
      bladeburner.skills[AllSkills[skill].name] += levelchange * modifier;
      bladeburner.updateSkillMultipliers();
    }
  };
  const addTonsOfSkill = () => {
    if (bladeburner.skills[AllSkills[skill].name] == null) resetSkill();
    bladeburner.skills[AllSkills[skill].name] += bigNumber;
    bladeburner.updateSkillMultipliers();
  };
  const resetSkill = () => {
    bladeburner.skills[AllSkills[skill].name] = 0;
    bladeburner.updateSkillMultipliers();
  };

  // Contract functions
  const AllContracts = bladeburner.contracts;
  const [contractTarget, setContract] = useState(AllContracts.Tracking.name as string);
  function setContractDropdown(event: SelectChangeEvent<string>): void {
    setContract(event.target.value);
  }
  const modifyContractLevel = (modifier: number) => (levelchange: number) => {
    if (!isNaN(levelchange)) {
      bladeburner.contracts[AllContracts[contractTarget].name].level += levelchange * modifier;
      const level = bladeburner.contracts[AllContracts[contractTarget].name].level;
      bladeburner.contracts[AllContracts[contractTarget].name].maxLevel = level;
    }
  };
  const modifyContractCount = (modifier: number) => (countchange: number) => {
    if (!isNaN(countchange)) bladeburner.contracts[AllContracts[contractTarget].name].count += countchange * modifier;
  };
  const modifyContractSuccesses = (modifier: number) => (successeschange: number) => {
    if (!isNaN(successeschange))
      bladeburner.contracts[AllContracts[contractTarget].name].successes += successeschange * modifier;
  };
  const addTonsOfContractLevel = () => {
    bladeburner.contracts[AllContracts[contractTarget].name].level += bigNumber;
    const level = bladeburner.contracts[AllContracts[contractTarget].name].level;
    bladeburner.contracts[AllContracts[contractTarget].name].maxLevel = level;
  };
  const addTonsOfContractCount = () => (bladeburner.contracts[AllContracts[contractTarget].name].count += bigNumber);
  const addTonsOfContractSuccesses = () =>
    (bladeburner.contracts[AllContracts[contractTarget].name].successes += bigNumber);
  const resetContractLevel = () => {
    bladeburner.contracts[AllContracts[contractTarget].name].level = 1;
    bladeburner.contracts[AllContracts[contractTarget].name].maxLevel = 1;
  };
  const resetContractCount = () => (bladeburner.contracts[AllContracts[contractTarget].name].count = 0);
  const resetContractSuccesses = () => (bladeburner.contracts[AllContracts[contractTarget].name].successes = 0);

  // Operation functions
  const AllOperations = bladeburner.operations;
  const [operationTarget, setOperation] = useState(AllOperations.Investigation.name as string);
  function setOperationDropdown(event: SelectChangeEvent<string>): void {
    setOperation(event.target.value);
  }
  const modifyOperationLevel = (modifier: number) => (levelchange: number) => {
    if (!isNaN(levelchange)) {
      bladeburner.operations[AllOperations[operationTarget].name].level += levelchange * modifier;
      const level = bladeburner.operations[AllOperations[operationTarget].name].level;
      bladeburner.operations[AllOperations[operationTarget].name].maxLevel = level;
    }
  };
  const modifyOperationCount = (modifier: number) => (countchange: number) => {
    if (!isNaN(countchange))
      bladeburner.operations[AllOperations[operationTarget].name].count += countchange * modifier;
  };
  const modifyOperationSuccesses = (modifier: number) => (successeschange: number) => {
    if (!isNaN(successeschange))
      bladeburner.operations[AllOperations[operationTarget].name].successes += successeschange * modifier;
  };
  const addTonsOfOperationLevel = () => {
    bladeburner.operations[AllOperations[operationTarget].name].level += bigNumber;
    const level = bladeburner.operations[AllOperations[operationTarget].name].level;
    bladeburner.operations[AllOperations[operationTarget].name].maxLevel = level;
  };
  const addTonsOfOperationCount = () =>
    (bladeburner.operations[AllOperations[operationTarget].name].count += bigNumber);
  const addTonsOfOperationSuccesses = () =>
    (bladeburner.operations[AllOperations[operationTarget].name].successes += bigNumber);
  const resetOperationLevel = () => {
    bladeburner.operations[AllOperations[operationTarget].name].level = 1;
    bladeburner.operations[AllOperations[operationTarget].name].maxLevel = 1;
  };
  const resetOperationCount = () => (bladeburner.operations[AllOperations[operationTarget].name].count = 0);
  const resetOperationSuccesses = () => (bladeburner.operations[AllOperations[operationTarget].name].successes = 0);

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Bladeburner</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <table>
          <tbody>
            <tr>
              <td>
                <Typography>Rank:</Typography>
              </td>
              <td>
                <Adjuster
                  label="rank"
                  placeholder="amt"
                  tons={addTonsBladeburnerRank}
                  add={modifyBladeburnerRank(1)}
                  subtract={modifyBladeburnerRank(-1)}
                  reset={resetBladeburnerRank}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>SP:</Typography>
              </td>
              <td>
                <Adjuster
                  label="skill points"
                  placeholder="amt"
                  tons={addTonsBladeburnerSP}
                  add={modifyBladeburnerSP(1)}
                  subtract={modifyBladeburnerSP(-1)}
                  reset={resetBladeburnerSP}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Cycles: </Typography>
              </td>
              <td>
                <Adjuster
                  label="cycles"
                  placeholder="amt"
                  tons={addTonsBladeburnerCycles}
                  add={modifyBladeburnerCycles(1)}
                  subtract={modifyBladeburnerCycles(-1)}
                  reset={resetBladeburnerCycles}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Chaos:</Typography>
              </td>
              <td>
                <Adjuster
                  label="chaos in all cities"
                  placeholder="amt"
                  tons={addTonsAllChaos}
                  add={addAllChaos(1)}
                  subtract={addAllChaos(-1)}
                  reset={wipeAllChaos}
                />
              </td>
              <Tooltip title="Wipe Active City Chaos">
                <IconButton
                  onClick={wipeActiveCityChaos}
                  size="large"
                  arial-label="clear-active-city-chaos"
                  title="Clear Only Active City Chaos"
                >
                  <DeleteIcon sx={{ fontSize: 40 }} />
                </IconButton>
              </Tooltip>
            </tr>
            <tr>
              <td>
                <Typography>Skills: </Typography>
              </td>
              <td align="center">
                <FormControl>
                  <InputLabel id="skills-select"></InputLabel>
                  <Select labelId="skills-select" id="skills-dropdown" onChange={setSkillDropdown} value={skill}>
                    {Object.values(AllSkills).map((skill) => (
                      <MenuItem key={skill.name} value={skill.name}>
                        {skill.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Level:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Level"
                  placeholder="amt"
                  tons={addTonsOfSkill}
                  add={modifySkill(1)}
                  subtract={modifySkill(-1)}
                  reset={resetSkill}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Contracts: </Typography>
              </td>
              <td align="center">
                <FormControl>
                  <InputLabel id="contracts-select"></InputLabel>
                  <Select
                    labelId="contracts-select"
                    id="contracts-dropdown"
                    onChange={setContractDropdown}
                    value={contractTarget}
                  >
                    {Object.values(AllContracts).map((contract) => (
                      <MenuItem key={contract.name} value={contract.name}>
                        {contract.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Level:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Level"
                  placeholder="amt"
                  tons={addTonsOfContractLevel}
                  add={modifyContractLevel(1)}
                  subtract={modifyContractLevel(-1)}
                  reset={resetContractLevel}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Successes:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Successes"
                  placeholder="amt"
                  tons={addTonsOfContractSuccesses}
                  add={modifyContractSuccesses(1)}
                  subtract={modifyContractSuccesses(-1)}
                  reset={resetContractSuccesses}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Count:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Count"
                  placeholder="amt"
                  tons={addTonsOfContractCount}
                  add={modifyContractCount(1)}
                  subtract={modifyContractCount(-1)}
                  reset={resetContractCount}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Operations: </Typography>
              </td>
              <td align="center">
                <FormControl>
                  <InputLabel id="Operations-select"></InputLabel>
                  <Select
                    labelId="Operations-select"
                    id="Operations-dropdown"
                    onChange={setOperationDropdown}
                    value={operationTarget}
                  >
                    {Object.values(AllOperations).map((Operation) => (
                      <MenuItem key={Operation.name} value={Operation.name}>
                        {Operation.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Level:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Level"
                  placeholder="amt"
                  tons={addTonsOfOperationLevel}
                  add={modifyOperationLevel(1)}
                  subtract={modifyOperationLevel(-1)}
                  reset={resetOperationLevel}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Successes:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Successes"
                  placeholder="amt"
                  tons={addTonsOfOperationSuccesses}
                  add={modifyOperationSuccesses(1)}
                  subtract={modifyOperationSuccesses(-1)}
                  reset={resetOperationSuccesses}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Typography>Count:</Typography>
              </td>
              <td>
                <Adjuster
                  label="Count"
                  placeholder="amt"
                  tons={addTonsOfOperationCount}
                  add={modifyOperationCount(1)}
                  subtract={modifyOperationCount(-1)}
                  reset={resetOperationCount}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
