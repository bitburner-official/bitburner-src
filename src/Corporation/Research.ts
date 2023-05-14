import { CorpResearchName } from "@nsdefs";

export interface ResearchParams {
  name: CorpResearchName;
  cost: number;
  desc: string;
  advertisingMult?: number;
  employeeChaMult?: number;
  employeeCreMult?: number;
  employeeEffMult?: number;
  employeeIntMult?: number;
  productionMult?: number;
  productProductionMult?: number;
  salesMult?: number;
  sciResearchMult?: number;
  storageMult?: number;
}

export class Research {
  // Name of research. This will be used to identify researches in the Research Tree
  name: CorpResearchName = "AutoBrew";

  // How much scientific research it costs to unlock this
  cost = 0;

  // Description of what the Research does
  description = "";

  // All possible generic upgrades for the company, in the form of multipliers
  advertisingMult = 1;
  employeeChaMult = 1;
  employeeCreMult = 1;
  employeeEffMult = 1;
  employeeIntMult = 1;
  productionMult = 1;
  productProductionMult = 1;
  salesMult = 1;
  sciResearchMult = 1;
  storageMult = 1;

  constructor(p: ResearchParams | null = null) {
    if (!p) return;
    this.name = p.name;
    this.cost = p.cost;
    this.description = p.desc;
    this.advertisingMult = p.advertisingMult ?? 1;
    this.employeeChaMult = p.employeeChaMult ?? 1;
    this.employeeCreMult = p.employeeCreMult ?? 1;
    this.employeeEffMult = p.employeeEffMult ?? 1;
    this.employeeIntMult = p.employeeIntMult ?? 1;
    this.productionMult = p.productionMult ?? 1;
    this.productProductionMult = p.productProductionMult ?? 1;
    this.salesMult = p.salesMult ?? 1;
    this.sciResearchMult = p.sciResearchMult ?? 1;
    this.storageMult = p.storageMult ?? 1;
  }
}
