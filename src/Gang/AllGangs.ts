import { FactionName } from "@enums";
import { Reviver } from "../utils/GenericReviver";
import { JsonSchemaValidator } from "../JsonSchema/JsonSchemaValidator";
import { dialogBoxCreate } from "../ui/React/DialogBox";

interface GangTerritory {
  power: number;
  territory: number;
}

export function getDefaultAllGangs() {
  return {
    [FactionName.SlumSnakes]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.Tetrads]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheSyndicate]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheDarkArmy]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.SpeakersForTheDead]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.NiteSec]: {
      power: 1,
      territory: 1 / 7,
    },
    [FactionName.TheBlackHand]: {
      power: 1,
      territory: 1 / 7,
    },
  };
}

export let AllGangs: Record<string, GangTerritory> = getDefaultAllGangs();

export function resetGangs(): void {
  AllGangs = getDefaultAllGangs();
}

export function loadAllGangs(saveString: string): void {
  let allGangsData: unknown;
  let validate;
  try {
    allGangsData = JSON.parse(saveString, Reviver);
    validate = JsonSchemaValidator.AllGangs;
    if (!validate(allGangsData)) {
      console.error("validate.errors:", validate.errors);
      // validate.errors is an array of objects, so we need to use JSON.stringify.
      throw new Error(JSON.stringify(validate.errors));
    }
  } catch (error) {
    console.error(error);
    console.error("Invalid AllGangsSave:", saveString);
    resetGangs();
    setTimeout(() => {
      dialogBoxCreate(`Cannot load data of AllGangs. AllGangs is reset. Error: ${error}.`);
    }, 1000);
    return;
  }
  AllGangs = allGangsData;
}

export function getClashWinChance(thisGang: string, otherGang: string): number {
  const thisGangPower = AllGangs[thisGang].power;
  const otherGangPower = AllGangs[otherGang].power;
  return thisGangPower / (thisGangPower + otherGangPower);
}
