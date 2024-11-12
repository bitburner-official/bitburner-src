import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { Infiltration as NetscriptInfiltation, InfiltrationLocation } from "@nsdefs";
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
import { exceptionAlert } from "../utils/helpers/exceptionAlert";

export function NetscriptInfiltration(): InternalAPI<NetscriptInfiltation> {
  const getLocationsWithInfiltrations = Object.values(Locations).filter(
    (location: Location) => location.infiltrationData,
  );

  const calculateInfiltrationData = (ctx: NetscriptContext, locationName: LocationName): InfiltrationLocation => {
    const location = Locations[locationName];
    if (location === undefined) {
      throw helpers.errorMessage(ctx, `Location "${locationName}" does not exist.`);
    }
    if (location.infiltrationData === undefined) {
      throw helpers.errorMessage(ctx, `Location "${locationName}" does not provide infiltrations.`);
    }
    const locationCity = location.city;
    /**
     * location.city is only null when the location is available in all cities. This kind of location does not have
     * infiltration data.
     */
    if (locationCity === null) {
      const errorMessage = `Location "${locationName}" is available in all cities, but it still has infiltration data.`;
      exceptionAlert(new Error(errorMessage));
      throw helpers.errorMessage(ctx, errorMessage);
    }
    const startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
    const difficulty = calculateDifficulty(startingSecurityLevel);
    const reward = calculateReward(startingSecurityLevel);
    const maxLevel = location.infiltrationData.maxClearanceLevel;
    return {
      location: {
        city: locationCity,
        name: location.name,
      },
      reward: {
        tradeRep: calculateTradeInformationRepReward(reward, maxLevel, startingSecurityLevel),
        sellCash: calculateSellInformationCashReward(reward, maxLevel, startingSecurityLevel),
        SoARep: calculateInfiltratorsRepReward(Factions[FactionName.ShadowsOfAnarchy], startingSecurityLevel),
      },
      difficulty: difficulty,
      maxClearanceLevel: location.infiltrationData.maxClearanceLevel,
      startingSecurityLevel: location.infiltrationData.startingSecurityLevel,
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
