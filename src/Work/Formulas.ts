import { Person as IPerson } from "@nsdefs";
import { Player } from "@player";

import { BitNodeMultipliers } from "../BitNode/BitNodeMultipliers";
import { Company } from "../Company/Company";
import { CompanyPosition } from "../Company/CompanyPosition";
import { CONSTANTS } from "../Constants";
import { Crime } from "../Crime/Crime";
import { FactionWorkType, GymType } from "../Enums";
import { LocationName } from "../Enums";
import { Location } from "../Locations/Location";
import { Locations } from "../Locations/Locations";
import {
  getFactionFieldWorkRepGain,
  getFactionSecurityWorkRepGain,
  getHackingWorkRepGain,
} from "../PersonObjects/formulas/reputation";
import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { serverMetadata } from "../Server/data/servers";
import { checkEnum } from "../utils/helpers/enum";
import { Class, ClassType, Classes } from "./ClassWork";
import { WorkStats, multWorkStats, newWorkStats, scaleWorkStats } from "./WorkStats";

const gameCPS = 1000 / CONSTANTS.MilliPerCycle; // 5 cycles per second
export const FactionWorkStats: Record<FactionWorkType, WorkStats> = {
  [FactionWorkType.hacking]: newWorkStats({ hackExp: 2 }),
  [FactionWorkType.field]: newWorkStats({
    hackExp: 1,
    strExp: 1,
    defExp: 1,
    dexExp: 1,
    agiExp: 1,
    chaExp: 1,
  }),
  [FactionWorkType.security]: newWorkStats({
    hackExp: 0.5,
    strExp: 1.5,
    defExp: 1.5,
    dexExp: 1.5,
    agiExp: 1.5,
  }),
};

export function calculateCrimeWorkStats(person: IPerson, crime: Crime): WorkStats {
  const gains = scaleWorkStats(
    multWorkStats(
      //Todo: rework crime and workstats interfaces to use the same naming convention for exp values, then we can just make a workStats directly from a crime.
      newWorkStats({
        money: crime.money,
        hackExp: crime.hacking_exp,
        strExp: crime.strength_exp,
        defExp: crime.defense_exp,
        dexExp: crime.dexterity_exp,
        agiExp: crime.agility_exp,
        chaExp: crime.charisma_exp,
        intExp: crime.intelligence_exp,
      }),
      person.mults,
      person.mults.crime_money * BitNodeMultipliers.CrimeMoney,
    ),
    BitNodeMultipliers.CrimeExpGain,
    false,
  );
  return gains;
}

/** @returns faction rep rate per cycle */
export const calculateFactionRep = (person: IPerson, type: FactionWorkType, favor: number): number => {
  const repFormulas = {
    [FactionWorkType.hacking]: getHackingWorkRepGain,
    [FactionWorkType.field]: getFactionFieldWorkRepGain,
    [FactionWorkType.security]: getFactionSecurityWorkRepGain,
  };
  return repFormulas[type](person, favor);
};

/** @returns per-cycle WorkStats */
export function calculateFactionExp(person: IPerson, type: FactionWorkType): WorkStats {
  return scaleWorkStats(
    multWorkStats(FactionWorkStats[type], person.mults),
    BitNodeMultipliers.FactionWorkExpGain / gameCPS,
  );
}

/** Calculate cost for a class */
export function calculateCost(classs: Class, location: Location): number {
  const serverMeta = serverMetadata.find((s) => s.specialName === location.name);
  const server = GetServer(serverMeta ? serverMeta.hostname : "");
  const discount = (server as Server).backdoorInstalled ? 0.9 : 1;
  return classs.earnings.money * location.costMult * discount;
}

/** @returns per-cycle WorkStats */
export function calculateClassEarnings(person: IPerson, type: ClassType, locationName: LocationName): WorkStats {
  const hashManager = Player.hashManager;
  const classs = Classes[type];
  const location = Locations[locationName];

  const hashMult = checkEnum(GymType, type) ? hashManager.getTrainingMult() : hashManager.getStudyMult();

  const earnings = multWorkStats(
    scaleWorkStats(classs.earnings, (location.expMult / gameCPS) * hashMult, false),
    person.mults,
  );
  earnings.money = calculateCost(classs, location) / gameCPS;
  return earnings;
}

/** @returns per-cycle WorkStats */
export const calculateCompanyWorkStats = (
  worker: IPerson,
  company: Company,
  companyPosition: CompanyPosition,
  favor: number,
): WorkStats => {
  // If player has SF-11, calculate salary multiplier from favor
  const favorMult = isNaN(favor) ? 1 : 1 + favor / 100;
  const bn11Mult = Player.sourceFileLvl(11) > 0 ? favorMult : 1;

  const gains = scaleWorkStats(
    multWorkStats(
      {
        money: companyPosition.baseSalary * company.salaryMultiplier * bn11Mult * BitNodeMultipliers.CompanyWorkMoney,
        hackExp: companyPosition.hackingExpGain,
        strExp: companyPosition.strengthExpGain,
        defExp: companyPosition.defenseExpGain,
        dexExp: companyPosition.dexterityExpGain,
        agiExp: companyPosition.agilityExpGain,
        chaExp: companyPosition.charismaExpGain,
      },
      worker.mults,
      worker.mults.work_money,
    ),
    company.expMultiplier * BitNodeMultipliers.CompanyWorkExpGain,
    false,
  );

  const jobPerformance = companyPosition.calculateJobPerformance(worker);

  gains.reputation = jobPerformance * worker.mults.company_rep * favorMult;

  return gains;
};
