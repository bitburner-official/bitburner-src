import * as posNames from "./JobTracks";
import { IConstructorParams } from "../Company";

import { CompanyName } from "@enums";

// These are grossly typed, need to address
// Create Objects containing Company Positions by category
// Will help in metadata construction later
const AllSoftwarePositions: Record<string, boolean> = {};
const AllITPositions: Record<string, boolean> = {};
const AllNetworkEngineerPositions: Record<string, boolean> = {};
const SecurityEngineerPositions: Record<string, boolean> = {};
const AllTechnologyPositions: Record<string, boolean> = {};
const AllBusinessPositions: Record<string, boolean> = {};
const AllAgentPositions: Record<string, boolean> = {};
const AllSecurityPositions: Record<string, boolean> = {};
const AllSoftwareConsultantPositions: Record<string, boolean> = {};
const AllBusinessConsultantPositions: Record<string, boolean> = {};
const SoftwarePositionsUpToHeadOfEngineering: Record<string, boolean> = {};
const SoftwarePositionsUpToLeadDeveloper: Record<string, boolean> = {};
const BusinessPositionsUpToOperationsManager: Record<string, boolean> = {};
const WaiterOnly: Record<string, boolean> = {};
const EmployeeOnly: Record<string, boolean> = {};
const PartTimeWaiterOnly: Record<string, boolean> = {};
const PartTimeEmployeeOnly: Record<string, boolean> = {};
const OperationsManagerOnly: Record<string, boolean> = {};
const CEOOnly: Record<string, boolean> = {};

posNames.SoftwareCompanyPositions.forEach((e) => {
  AllSoftwarePositions[e] = true;
  AllTechnologyPositions[e] = true;
});

posNames.ITCompanyPositions.forEach((e) => {
  AllITPositions[e] = true;
  AllTechnologyPositions[e] = true;
});

posNames.NetworkEngineerCompanyPositions.forEach((e) => {
  AllNetworkEngineerPositions[e] = true;
  AllTechnologyPositions[e] = true;
});

AllTechnologyPositions[posNames.SecurityEngineerCompanyPositions[0]] = true;
SecurityEngineerPositions[posNames.SecurityEngineerCompanyPositions[0]] = true;

posNames.BusinessCompanyPositions.forEach((e) => {
  AllBusinessPositions[e] = true;
});

posNames.SecurityCompanyPositions.forEach((e) => {
  AllSecurityPositions[e] = true;
});

posNames.AgentCompanyPositions.forEach((e) => {
  AllAgentPositions[e] = true;
});

posNames.SoftwareConsultantCompanyPositions.forEach((e) => {
  AllSoftwareConsultantPositions[e] = true;
});

posNames.BusinessConsultantCompanyPositions.forEach((e) => {
  AllBusinessConsultantPositions[e] = true;
});

for (let i = 0; i < posNames.SoftwareCompanyPositions.length; ++i) {
  const e = posNames.SoftwareCompanyPositions[i];
  if (i <= 5) {
    SoftwarePositionsUpToHeadOfEngineering[e] = true;
  }
  if (i <= 3) {
    SoftwarePositionsUpToLeadDeveloper[e] = true;
  }
}
for (let i = 0; i < posNames.BusinessCompanyPositions.length; ++i) {
  const e = posNames.BusinessCompanyPositions[i];
  if (i <= 3) {
    BusinessPositionsUpToOperationsManager[e] = true;
  }
}

WaiterOnly[posNames.MiscCompanyPositions[0]] = true;
EmployeeOnly[posNames.MiscCompanyPositions[1]] = true;
PartTimeWaiterOnly[posNames.PartTimeCompanyPositions[0]] = true;
PartTimeEmployeeOnly[posNames.PartTimeCompanyPositions[1]] = true;
OperationsManagerOnly[posNames.BusinessCompanyPositions[3]] = true;
CEOOnly[posNames.BusinessCompanyPositions[5]] = true;

// Metadata
export const companiesMetadata: IConstructorParams[] = [
  {
    name: CompanyName.ECorp,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 3,
    salaryMultiplier: 3,
    jobStatReqOffset: 249,
  },
  {
    name: CompanyName.MegaCorp,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 3,
    salaryMultiplier: 3,
    jobStatReqOffset: 249,
  },
  {
    name: CompanyName.BachmanAndAssociates,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.6,
    salaryMultiplier: 2.6,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.BladeIndustries,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.75,
    salaryMultiplier: 2.75,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.NWO,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.75,
    salaryMultiplier: 2.75,
    jobStatReqOffset: 249,
  },
  {
    name: CompanyName.ClarkeIncorporated,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.25,
    salaryMultiplier: 2.25,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.OmniTekIncorporated,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.25,
    salaryMultiplier: 2.25,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.FourSigma,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.5,
    salaryMultiplier: 2.5,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.KuaiGongInternational,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSecurityPositions),
    expMultiplier: 2.2,
    salaryMultiplier: 2.2,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.FulcrumTechnologies,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions),
    expMultiplier: 2,
    salaryMultiplier: 2,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.StormTechnologies,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllSoftwareConsultantPositions, AllBusinessPositions),
    expMultiplier: 1.8,
    salaryMultiplier: 1.8,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.DefComm,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, AllTechnologyPositions, AllSoftwareConsultantPositions),
    expMultiplier: 1.75,
    salaryMultiplier: 1.75,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.HeliosLabs,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, AllTechnologyPositions, AllSoftwareConsultantPositions),
    expMultiplier: 1.8,
    salaryMultiplier: 1.8,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.VitaLife,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSoftwareConsultantPositions),
    expMultiplier: 1.8,
    salaryMultiplier: 1.8,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.IcarusMicrosystems,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSoftwareConsultantPositions),
    expMultiplier: 1.9,
    salaryMultiplier: 1.9,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.UniversalEnergy,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSoftwareConsultantPositions),
    expMultiplier: 2,
    salaryMultiplier: 2,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.GalacticCybersystems,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions, AllBusinessPositions, AllSoftwareConsultantPositions),
    expMultiplier: 1.9,
    salaryMultiplier: 1.9,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.AeroCorp,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, OperationsManagerOnly, AllTechnologyPositions, AllSecurityPositions),
    expMultiplier: 1.7,
    salaryMultiplier: 1.7,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.OmniaCybersystems,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, OperationsManagerOnly, AllTechnologyPositions, AllSecurityPositions),
    expMultiplier: 1.7,
    salaryMultiplier: 1.7,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.SolarisSpaceSystems,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, OperationsManagerOnly, AllTechnologyPositions, AllSecurityPositions),
    expMultiplier: 1.7,
    salaryMultiplier: 1.7,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.DeltaOne,
    info: "",
    companyPositions: Object.assign({}, CEOOnly, OperationsManagerOnly, AllTechnologyPositions, AllSecurityPositions),
    expMultiplier: 1.6,
    salaryMultiplier: 1.6,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.GlobalPharmaceuticals,
    info: "",
    companyPositions: Object.assign(
      {},
      AllTechnologyPositions,
      AllBusinessPositions,
      AllSoftwareConsultantPositions,
      AllSecurityPositions,
    ),
    expMultiplier: 1.8,
    salaryMultiplier: 1.8,
    jobStatReqOffset: 224,
  },
  {
    name: CompanyName.NovaMedical,
    info: "",
    companyPositions: Object.assign(
      {},
      AllTechnologyPositions,
      AllBusinessPositions,
      AllSoftwareConsultantPositions,
      AllSecurityPositions,
    ),
    expMultiplier: 1.75,
    salaryMultiplier: 1.75,
    jobStatReqOffset: 199,
  },
  {
    name: CompanyName.CIA,
    info: "",
    companyPositions: Object.assign(
      {},
      SoftwarePositionsUpToHeadOfEngineering,
      AllNetworkEngineerPositions,
      SecurityEngineerPositions,
      AllITPositions,
      AllSecurityPositions,
      AllAgentPositions,
    ),
    expMultiplier: 2,
    salaryMultiplier: 2,
    jobStatReqOffset: 149,
  },
  {
    name: CompanyName.NSA,
    info: "",
    companyPositions: Object.assign(
      {},
      SoftwarePositionsUpToHeadOfEngineering,
      AllNetworkEngineerPositions,
      SecurityEngineerPositions,
      AllITPositions,
      AllSecurityPositions,
      AllAgentPositions,
    ),
    expMultiplier: 2,
    salaryMultiplier: 2,
    jobStatReqOffset: 149,
  },
  {
    name: CompanyName.WatchdogSecurity,
    info: "",
    companyPositions: Object.assign(
      {},
      SoftwarePositionsUpToHeadOfEngineering,
      AllNetworkEngineerPositions,
      AllITPositions,
      AllSecurityPositions,
      AllAgentPositions,
      AllSoftwareConsultantPositions,
    ),
    expMultiplier: 1.5,
    salaryMultiplier: 1.5,
    jobStatReqOffset: 124,
  },
  {
    name: CompanyName.LexoCorp,
    info: "",
    companyPositions: Object.assign(
      {},
      AllTechnologyPositions,
      AllSoftwareConsultantPositions,
      AllBusinessPositions,
      AllSecurityPositions,
    ),
    expMultiplier: 1.4,
    salaryMultiplier: 1.4,
    jobStatReqOffset: 99,
  },
  {
    name: CompanyName.RhoConstruction,
    info: "",
    companyPositions: Object.assign({}, SoftwarePositionsUpToLeadDeveloper, BusinessPositionsUpToOperationsManager),
    expMultiplier: 1.3,
    salaryMultiplier: 1.3,
    jobStatReqOffset: 49,
  },
  {
    name: CompanyName.AlphaEnterprises,
    info: "",
    companyPositions: Object.assign(
      {},
      SoftwarePositionsUpToLeadDeveloper,
      BusinessPositionsUpToOperationsManager,
      AllSoftwareConsultantPositions,
    ),
    expMultiplier: 1.5,
    salaryMultiplier: 1.5,
    jobStatReqOffset: 99,
  },
  {
    name: CompanyName.Police,
    info: "",
    companyPositions: Object.assign({}, AllSecurityPositions, SoftwarePositionsUpToLeadDeveloper),
    expMultiplier: 1.3,
    salaryMultiplier: 1.3,
    jobStatReqOffset: 99,
  },
  {
    name: CompanyName.SysCoreSecurities,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions),
    expMultiplier: 1.3,
    salaryMultiplier: 1.3,
    jobStatReqOffset: 124,
  },
  {
    name: CompanyName.CompuTek,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions),
    expMultiplier: 1.2,
    salaryMultiplier: 1.2,
    jobStatReqOffset: 74,
  },
  {
    name: CompanyName.NetLinkTechnologies,
    info: "",
    companyPositions: Object.assign({}, AllTechnologyPositions),
    expMultiplier: 1.2,
    salaryMultiplier: 1.2,
    jobStatReqOffset: 99,
  },
  {
    name: CompanyName.CarmichaelSecurity,
    info: "",
    companyPositions: Object.assign(
      {},
      AllTechnologyPositions,
      AllSoftwareConsultantPositions,
      AllAgentPositions,
      AllSecurityPositions,
    ),
    expMultiplier: 1.2,
    salaryMultiplier: 1.2,
    jobStatReqOffset: 74,
  },
  {
    name: CompanyName.FoodNStuff,
    info: "",
    companyPositions: Object.assign({}, EmployeeOnly, PartTimeEmployeeOnly),
    expMultiplier: 1,
    salaryMultiplier: 1,
    jobStatReqOffset: 0,
  },
  {
    name: CompanyName.JoesGuns,
    info: "",
    companyPositions: Object.assign({}, EmployeeOnly, PartTimeEmployeeOnly),
    expMultiplier: 1,
    salaryMultiplier: 1,
    jobStatReqOffset: 0,
  },
  {
    name: CompanyName.OmegaSoftware,
    info: "",
    companyPositions: Object.assign({}, AllSoftwarePositions, AllSoftwareConsultantPositions, AllITPositions),
    expMultiplier: 1.1,
    salaryMultiplier: 1.1,
    jobStatReqOffset: 49,
  },
  {
    name: CompanyName.NoodleBar,
    info: "",
    companyPositions: Object.assign({}, WaiterOnly, PartTimeWaiterOnly),
    expMultiplier: 1,
    salaryMultiplier: 1,
    jobStatReqOffset: 0,
  },
];
