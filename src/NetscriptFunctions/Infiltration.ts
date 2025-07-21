import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Infiltration as NetscriptInfiltation, InfiltrationLocation, Result } from "@nsdefs";
import { FactionName, LocationName } from "@enums";
import { Location } from "../Locations/Location";
import { Locations } from "../Locations/Locations";
import {
  calculateDifficulty,
  calculateReward,
  calculateMarketDemandMultiplier,
  MaxDifficultyForInfiltration,
} from "../Infiltration/formulas/game";
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
import { Player } from "@player";
import { Page } from "../ui/Router";
import { Router } from "../ui/GameRoot";
import { getState, InfiltrationKeyEvents } from "../Infiltration/State";

function checkAccess(ctx: NetscriptContext, lvl = 1): void {
  if (Player.bitNodeN === 11 || Player.activeSourceFileLvl(11) >= lvl) {
    return;
  }
  const extra = lvl === 1 ? "" : "." + lvl;
  throw helpers.errorMessage(
    ctx,
    `This infiltration function requires SF 11${extra} to run. A power up you obtain later in the game. It will be very obvious when and how you can obtain it.`,
    "API ACCESS",
  );
}

function getInfilLocation(locationName: LocationName): Result<{ location: Required<Location> }> {
  const location = Locations[locationName];
  if (location == null) {
    return { success: false, message: `Location "${locationName}" does not exist.` };
  }
  if (!location.infiltrationData) {
    return { success: false, message: `Location "${locationName}" does not provide infiltrations.` };
  }
  // Currently TypeScript is not smart enough to figure this out without a dumb hack.
  return { success: true, location: { ...location, infiltrationData: location.infiltrationData } };
}

export function NetscriptInfiltration(): InternalAPI<NetscriptInfiltation> {
  const getLocationsWithInfiltrations = Object.values(Locations).filter(
    (location: Location) => location.infiltrationData,
  );

  const calculateInfiltrationData = (ctx: NetscriptContext, locationName: LocationName): InfiltrationLocation => {
    const result = getInfilLocation(locationName);
    if (!result.success) {
      throw helpers.errorMessage(ctx, result.message);
    }
    const location = result.location;
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
    // This is supposed to calculate the constant reward, without market demand.
    // We simulate this by using a time far in the future.
    const timestamp = Date.now() + 1e20;
    const reward = calculateReward(startingSecurityLevel);
    const maxLevel = location.infiltrationData.maxClearanceLevel;
    return {
      location: {
        city: locationCity,
        name: location.name,
      },
      reward: {
        tradeRep: calculateTradeInformationRepReward(reward, maxLevel, startingSecurityLevel, timestamp),
        sellCash: calculateSellInformationCashReward(reward, maxLevel, startingSecurityLevel, timestamp),
        SoARep: calculateInfiltratorsRepReward(
          Factions[FactionName.ShadowsOfAnarchy],
          maxLevel,
          startingSecurityLevel,
          timestamp,
        ),
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
    getMarketDemand: (ctx) => () => {
      checkAccess(ctx);
      return calculateMarketDemandMultiplier(Date.now(), false);
    },
    startInfiltration: (ctx) => () => {
      checkAccess(ctx, 3);
      if (Router.page() !== Page.Location) {
        return { success: false, message: `Must be at the location screen, currently showing ${Router.page()}` };
      }
      const result = getInfilLocation(Player.location);
      if (!result.success) {
        return { success: false, message: result.message };
      }
      const location = result.location;
      // Technically we don't need this check, but it's nicer to have it up-front.
      // It is a duplicate, so watch out for divergence with the same code in Intro.tsx.
      const startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
      const difficulty = calculateDifficulty(startingSecurityLevel);
      if (difficulty >= MaxDifficultyForInfiltration) {
        return {
          success: false,
          message: "This location is too secure for your current abilities. You cannot infiltrate it.",
        };
      }
      Router.toPage(Page.Infiltration, { location, autoStart: true });
      return { success: true };
    },
    getState: (__) => () => {
      if (Router.page() !== Page.Infiltration) {
        return null;
      }
      return getState();
    },
    pressKey: (ctx) => (_key) => {
      const key = helpers.string(ctx, "key", _key);
      const result = getInfilLocation(Player.location);
      if (Router.page() !== Page.Infiltration || !result.success) {
        // Perform a no-op if we're not infiltrating. The lack of delay should
        // help clue people in who are debugging.
        return Promise.resolve();
      }
      // Technically your stats can still change while you are infiltrating,
      // so this does not reflect the same difficulty as the actual infil.
      // Like the quirks with hack and grow, this is considered OK.
      const difficulty = calculateDifficulty(result.location.infiltrationData.startingSecurityLevel);
      const noise = difficulty < 1 ? 0 : 10 * difficulty;
      const delay = 60 + difficulty * 30 + Math.random() * noise;
      return helpers.netscriptDelay(ctx, delay).then(() => {
        InfiltrationKeyEvents.emit(key);
      });
    },
    pressSpace: (__) => () => {
      InfiltrationKeyEvents.emit(" ");
    },
  };
}
