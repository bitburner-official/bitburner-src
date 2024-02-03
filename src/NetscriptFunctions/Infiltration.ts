import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { Infiltration as NetscriptInfiltation, InfiltrationLocation, ILocation } from "@nsdefs";
import { FactionName, LocationName } from "@enums";
import { Location } from "../Locations/Location";
import { Locations } from "../Locations/Locations";
import { calculateDifficulty, calculateReward } from "../Infiltration/formulas/game";
import {
  calculateInfiltratorsRepReward,
  calculateSellInformationCashReward,
  calculateTradeInformationRepReward,
} from "../Infiltration/formulas/victory";
import { Factions } from "../Faction/Factions";
import { getEnumHelper } from "../utils/EnumHelper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { filterTruthy } from "../utils/helpers/ArrayHelpers";

export function NetscriptInfiltration(): InternalAPI<NetscriptInfiltation> {
  const getLocationsWithInfiltrations = Object.values(Locations).filter(
    (location: Location) => location.infiltrationData,
  );

  const calculateInfiltrationData = (ctx: NetscriptContext, locationName: LocationName): InfiltrationLocation => {
    const location = Locations[locationName];
    if (location === undefined) throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not exists.`);
    if (location.infiltrationData === undefined)
      throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not provide infiltrations.`);
    const startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
    const difficulty = calculateDifficulty(startingSecurityLevel);
    const reward = calculateReward(startingSecurityLevel);
    const maxLevel = location.infiltrationData.maxClearanceLevel;
    return {
      location: structuredClone(location) as ILocation,
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
      return filterTruthy(
        getLocationsWithInfiltrations.map((l) => {
          if (!l.city) return false;
          return {
            city: l.city,
            name: l.name,
          };
        }),
      );
    },
    getInfiltration: (ctx) => (_locationName) => {
      const locationName = getEnumHelper("LocationName").nsGetMember(ctx, _locationName);
      return calculateInfiltrationData(ctx, locationName);
    },
  };
}
