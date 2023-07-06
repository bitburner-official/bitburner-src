import { Player } from "@player";
import { CompanyName } from "@enums";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Sleeve } from "../Sleeve";
import { applySleeveGains, SleeveWorkClass, SleeveWorkType } from "./Work";
import { Companies } from "../../../Company/Companies";
import { Company } from "../../../Company/Company";
import { calculateCompanyWorkStats } from "../../../Work/Formulas";
import { scaleWorkStats, WorkStats } from "../../../Work/WorkStats";
import { influenceStockThroughCompanyWork } from "../../../StockMarket/PlayerInfluencing";
import { CompanyPositions } from "../../../Company/CompanyPositions";
import { isMember } from "../../../utils/EnumHelper";
import { invalidWork } from "../../../Work/InvalidWork";

export const isSleeveCompanyWork = (w: SleeveWorkClass | null): w is SleeveCompanyWork =>
  w !== null && w.type === SleeveWorkType.COMPANY;

export class SleeveCompanyWork extends SleeveWorkClass {
  type: SleeveWorkType.COMPANY = SleeveWorkType.COMPANY;
  companyName: CompanyName;

  constructor(companyName = CompanyName.NoodleBar) {
    super();
    this.companyName = companyName;
  }

  getCompany(): Company {
    return Companies[this.companyName];
  }

  getGainRates(sleeve: Sleeve): WorkStats {
    const company = this.getCompany();
    return scaleWorkStats(
      calculateCompanyWorkStats(sleeve, company, CompanyPositions[Player.jobs[company.name]], company.favor),
      sleeve.shockBonus(),
      false,
    );
  }

  process(sleeve: Sleeve, cycles: number) {
    const company = this.getCompany();
    const gains = this.getGainRates(sleeve);
    applySleeveGains(sleeve, gains, cycles);
    company.playerReputation += gains.reputation * cycles;
    influenceStockThroughCompanyWork(company, gains.reputation, cycles);
  }

  APICopy() {
    return {
      type: SleeveWorkType.COMPANY as "COMPANY",
      companyName: this.companyName,
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveCompanyWork", this);
  }

  /** Initializes a CompanyWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveCompanyWork {
    const work = Generic_fromJSON(SleeveCompanyWork, value.data);
    if (!isMember("CompanyName", work.companyName)) return invalidWork();
    return work;
  }
}

constructorsForReviver.SleeveCompanyWork = SleeveCompanyWork;
