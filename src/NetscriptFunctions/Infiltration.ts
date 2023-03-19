import { Infiltration as IInfiltration, InfiltrationLocation } from "@nsdefs";
import { Location } from "../Locations/Location";
import { Locations } from "../Locations/Locations";
import { calculateDifficulty, calculateReward } from "../Infiltration/formulas/game";
import {
  calculateInfiltratorsRepReward,
  calculateSellInformationCashReward,
  calculateTradeInformationRepReward,
} from "../Infiltration/formulas/victory";
import { FactionName } from "../Faction/data/Enums";
import { Factions } from "../Faction/Factions";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { getEnumHelper } from "../utils/helpers/enum";
import { CityName, LocationName } from "../data/Enums";
import { helpers } from "../Netscript/NetscriptHelpers";

export function NetscriptInfiltration(): InternalAPI<IInfiltration> {
  const getLocationsWithInfiltrations = Object.values(Locations).filter(
    (location: Location) => location.infiltrationData,
  );

  const calculateInfiltrationData = (ctx: NetscriptContext, _locationName: unknown): InfiltrationLocation => {
    const locationName = getEnumHelper(LocationName).nsGetMember(ctx, "locationName", _locationName);
    const location = Locations[locationName];
    if (location === undefined) throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not exists.`);
    if (location.infiltrationData === undefined)
      throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not provide infiltrations.`);
    const startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
    const difficulty = calculateDifficulty(startingSecurityLevel);
    const reward = calculateReward(startingSecurityLevel);
    const maxLevel = location.infiltrationData.maxClearanceLevel;
    return {
      location: JSON.parse(JSON.stringify(location)),
      reward: {
        tradeRep: calculateTradeInformationRepReward(reward, maxLevel, startingSecurityLevel),
        sellCash: calculateSellInformationCashReward(reward, maxLevel, startingSecurityLevel),
        SoARep: calculateInfiltratorsRepReward(Factions[FactionName.ShadowsOfAnarchy], startingSecurityLevel),
      },
      difficulty: difficulty,
    };
  };
  return {
    getPossibleLocations: () => () => {
      return getLocationsWithInfiltrations
        .filter((l) => l.city) //Guarantees no locations with a "null" entry, which should not be infiltratable anyway.
        .map((l) => ({
          city: l.city as CityName,
          name: l.name,
        }));
    },
    getInfiltration: (ctx) => (_location) => {
      const location = helpers.string(ctx, "location", _location);
      return calculateInfiltrationData(ctx, location);
    },
  };
}
