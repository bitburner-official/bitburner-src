import type { Sleeve } from "../Sleeve";

import React from "react";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";

import { Player } from "@player";
import { BladeburnerActionType, BladeburnerContractName, CityName, FactionName, LocationName } from "@enums";
import { Crimes } from "../../../Crime/Crimes";
import { Factions } from "../../../Faction/Factions";
import { getEnumHelper } from "../../../utils/EnumHelper";
import { SleeveWorkType } from "../Work/Work";
import { getRecordKeys } from "../../../Types/Record";

const universitySelectorOptions: string[] = [
  "Computer Science",
  "Data Structures",
  "Networks",
  "Algorithms",
  "Management",
  "Leadership",
];

const gymSelectorOptions: string[] = ["Train Strength", "Train Defense", "Train Dexterity", "Train Agility"];

const bladeburnerSelectorOptions: string[] = [
  "Training",
  "Field Analysis",
  "Recruitment",
  "Diplomacy",
  "Hyperbolic Regeneration Chamber",
  "Infiltrate Synthoids",
  "Support main sleeve",
  "Take on contracts",
];

interface IProps {
  sleeve: Sleeve;
  abc: [string, string, string];
  setABC: (abc: [string, string, string]) => void;
}

interface ITaskDetails {
  first: string[];
  second: (s1: string) => string[];
}

function possibleJobs(sleeve: Sleeve): string[] {
  // Array of all companies that other sleeves are working at
  const forbiddenCompanies: string[] = [];
  for (const otherSleeve of Player.sleeves) {
    if (sleeve === otherSleeve) {
      continue;
    }
    if (otherSleeve.currentWork?.type === SleeveWorkType.COMPANY) {
      forbiddenCompanies.push(otherSleeve.currentWork.companyName);
    }
  }
  const allJobs: string[] = Object.keys(Player.jobs);

  return allJobs.filter((company) => !forbiddenCompanies.includes(company));
}

function possibleFactions(sleeve: Sleeve): string[] {
  // Array of all factions that other sleeves are working for
  const forbiddenFactions = [FactionName.Bladeburners as string, FactionName.ShadowsOfAnarchy as string];
  if (Player.gang) {
    forbiddenFactions.push(Player.gang.facName);
  }
  for (const otherSleeve of Player.sleeves) {
    if (sleeve === otherSleeve) {
      continue;
    }
    if (otherSleeve.currentWork?.type === SleeveWorkType.FACTION) {
      forbiddenFactions.push(otherSleeve.currentWork.factionName);
    }
  }

  const factions = [];
  for (const fac of Player.factions) {
    if (!forbiddenFactions.includes(fac)) {
      factions.push(fac);
    }
  }

  return factions.filter((faction) => {
    const factionObj = Factions[faction];
    if (!factionObj) return false;
    const facInfo = factionObj.getInfo();
    return facInfo.offerHackingWork || facInfo.offerFieldWork || facInfo.offerSecurityWork;
  });
}

function possibleContracts(sleeve: Sleeve): BladeburnerContractName[] | ["------"] {
  const bb = Player.bladeburner;
  if (bb === null) {
    return ["------"];
  }
  let contracts = Object.values(BladeburnerContractName);
  for (const otherSleeve of Player.sleeves) {
    if (sleeve === otherSleeve) {
      continue;
    }
    if (
      otherSleeve.currentWork?.type === SleeveWorkType.BLADEBURNER &&
      otherSleeve.currentWork.actionId.type === BladeburnerActionType.Contract
    ) {
      const w = otherSleeve.currentWork;
      contracts = contracts.filter((x) => x != w.actionId.name);
    }
  }
  return contracts;
}

const tasks: {
  [key: string]: undefined | ((sleeve: Sleeve) => ITaskDetails);
  ["Idle"]: (sleeve: Sleeve) => ITaskDetails;
  ["Work for Company"]: (sleeve: Sleeve) => ITaskDetails;
  ["Work for Faction"]: (sleeve: Sleeve) => ITaskDetails;
  ["Commit Crime"]: (sleeve: Sleeve) => ITaskDetails;
  ["Take University Course"]: (sleeve: Sleeve) => ITaskDetails;
  ["Workout at Gym"]: (sleeve: Sleeve) => ITaskDetails;
  ["Perform Bladeburner Actions"]: (sleeve: Sleeve) => ITaskDetails;
  ["Shock Recovery"]: (sleeve: Sleeve) => ITaskDetails;
  ["Synchronize"]: (sleeve: Sleeve) => ITaskDetails;
} = {
  Idle: (): ITaskDetails => {
    return { first: ["------"], second: () => ["------"] };
  },
  "Work for Company": (sleeve: Sleeve): ITaskDetails => {
    let jobs = possibleJobs(sleeve);

    if (jobs.length === 0) jobs = ["------"];
    return { first: jobs, second: () => ["------"] };
  },
  "Work for Faction": (sleeve: Sleeve): ITaskDetails => {
    let factions = possibleFactions(sleeve);
    if (factions.length === 0) factions = ["------"];

    return {
      first: factions,
      second: (s1) => {
        if (!getEnumHelper("FactionName").isMember(s1)) return ["------"];
        const faction = Factions[s1];
        const facInfo = faction.getInfo();
        const options: string[] = [];
        if (facInfo.offerHackingWork) {
          options.push("Hacking Contracts");
        }
        if (facInfo.offerFieldWork) {
          options.push("Field Work");
        }
        if (facInfo.offerSecurityWork) {
          options.push("Security Work");
        }
        return options;
      },
    };
  },
  "Commit Crime": (): ITaskDetails => {
    return { first: Object.keys(Crimes), second: () => ["------"] };
  },
  "Take University Course": (sleeve: Sleeve): ITaskDetails => {
    let universities: string[] = [];
    switch (sleeve.city) {
      case CityName.Aevum:
        universities = [LocationName.AevumSummitUniversity];
        break;
      case CityName.Sector12:
        universities = [LocationName.Sector12RothmanUniversity];
        break;
      case CityName.Volhaven:
        universities = [LocationName.VolhavenZBInstituteOfTechnology];
        break;
      default:
        universities = ["No university available in city!"];
        break;
    }

    return { first: universitySelectorOptions, second: () => universities };
  },
  "Workout at Gym": (sleeve: Sleeve): ITaskDetails => {
    let gyms: string[] = [];
    switch (sleeve.city) {
      case CityName.Aevum:
        gyms = [LocationName.AevumCrushFitnessGym, LocationName.AevumSnapFitnessGym];
        break;
      case CityName.Sector12:
        gyms = [LocationName.Sector12IronGym, LocationName.Sector12PowerhouseGym];
        break;
      case CityName.Volhaven:
        gyms = [LocationName.VolhavenMilleniumFitnessGym];
        break;
      default:
        gyms = ["No gym available in city!"];
        break;
    }

    return { first: gymSelectorOptions, second: () => gyms };
  },
  "Perform Bladeburner Actions": (sleeve: Sleeve): ITaskDetails => {
    return {
      first: bladeburnerSelectorOptions,
      second: (s1: string) => {
        if (s1 === "Take on contracts") {
          return possibleContracts(sleeve);
        } else {
          return ["------"];
        }
      },
    };
  },
  "Shock Recovery": (): ITaskDetails => {
    return { first: ["------"], second: () => ["------"] };
  },
  Synchronize: (): ITaskDetails => {
    return { first: ["------"], second: () => ["------"] };
  },
};

const canDo = {
  Idle: () => true,
  "Work for Company": (sleeve: Sleeve) => possibleJobs(sleeve).length > 0,
  "Work for Faction": (sleeve: Sleeve) => possibleFactions(sleeve).length > 0,
  "Commit Crime": () => true,
  "Take University Course": (sleeve: Sleeve) =>
    [CityName.Aevum, CityName.Sector12, CityName.Volhaven].includes(sleeve.city),
  "Workout at Gym": (sleeve: Sleeve) => [CityName.Aevum, CityName.Sector12, CityName.Volhaven].includes(sleeve.city),
  "Perform Bladeburner Actions": () => !!Player.bladeburner,
  "Shock Recovery": (sleeve: Sleeve) => sleeve.shock > 0,
  Synchronize: (sleeve: Sleeve) => sleeve.sync < 100,
} as const;

export function TaskSelector(props: IProps): React.ReactElement {
  const s0 = props.abc[0];
  const s1 = props.abc[1];
  const s2 = props.abc[2];

  const validActions = getRecordKeys(canDo).filter((taskType) => canDo[taskType](props.sleeve));

  const detailsF = tasks[s0];
  if (detailsF === undefined) {
    throw new Error(`No function for task '${s0}'`);
  }
  const details = detailsF(props.sleeve);
  const details2 = details.second(s1);

  if (details.first.length > 0 && !details.first.includes(s1)) {
    props.setABC([s0, details.first[0], s2]);
  }
  if (details2.length > 0 && !details2.includes(s2)) {
    props.setABC([s0, s1, details2[0]]);
  }

  function onS0Change(event: SelectChangeEvent): void {
    const n = event.target.value;
    const detailsF = tasks[n];
    if (detailsF === undefined) {
      throw new Error(`No function for task '${s0}'`);
    }
    const details = detailsF(props.sleeve);
    const details2 = details.second(details.first[0]) ?? ["------"];
    props.setABC([n, details.first[0], details2[0]]);
  }

  function onS1Change(event: SelectChangeEvent): void {
    props.setABC([s0, event.target.value, s2]);
  }

  function onS2Change(event: SelectChangeEvent): void {
    props.setABC([s0, s1, event.target.value]);
  }

  return (
    <>
      <Select onChange={onS0Change} value={s0} sx={{ width: "100%" }}>
        {validActions.map((task) => (
          <MenuItem key={task} value={task}>
            {task}
          </MenuItem>
        ))}
      </Select>
      {!(details.first.length === 1 && details.first[0] === "------") && (
        <>
          <Select onChange={onS1Change} value={s1} sx={{ width: "100%" }}>
            {details.first.map((detail) => (
              <MenuItem key={detail} value={detail}>
                {detail}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
      {!(details2.length === 1 && details2[0] === "------") && (
        <>
          <Select onChange={onS2Change} value={s2} sx={{ width: "100%" }}>
            {details2.map((detail) => (
              <MenuItem key={detail} value={detail}>
                {detail}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    </>
  );
}
