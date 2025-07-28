import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Infiltration as NetscriptInfiltation, InfiltrationLocation, Result } from "@nsdefs";
import { FactionName, LocationName, AugmentationName } from "@enums";
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
import { getState, stageState, victoryState, InfiltrationKeyEvents } from "../Infiltration/State";
import { formatMoney, formatReputation } from "../ui/formatNumber";
import { words as dictionaryWords, positiveAdjectives, negativeAdjectives } from "../Infiltration/data";
import { shuffleArray } from "../utils/helpers/shuffleArray";

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

// This doubles as a check to see if we're currently infiltrating
function getPlayerLocation(ctx: NetscriptContext): Required<Location> | null {
  if (Router.page() !== Page.Infiltration) {
    helpers.log(ctx, () => `Must be at the infiltration screen, currently showing ${Router.page()}`);
    return null;
  }
  const result = getInfilLocation(Player.location);
  if (!result.success) {
    helpers.log(ctx, () => result.message);
    return null;
  }
  return result.location;
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
    startInfiltration: (ctx) => (_locationName) => {
      checkAccess(ctx, 3);
      const locationName = getEnumHelper("LocationName").nsGetMember(ctx, _locationName);
      const validPages = [
        Page.Terminal,
        Page.ScriptEditor,
        Page.ActiveScripts,
        Page.City,
        Page.Location,
        Page.Infiltration,
      ];
      const locationPages: Page[] = [Page.Location, Page.Infiltration];
      const result: Result = (() => {
        if (!validPages.includes(Router.page())) {
          const vpStr = validPages.map((x) => `"${x}"`).join(", ");
          return {
            success: false,
            message: `Must be at one of these screens: [${vpStr}], currently showing ${Router.page()}`,
          };
        }
        const result = getInfilLocation(locationName);
        if (!result.success) {
          return { success: false, message: result.message };
        }
        if (locationPages.includes(Router.page()) && Player.location !== locationName) {
          return {
            success: false,
            message: `Trying to infiltrate ${locationName}, but you are currently at ${Player.location}`,
          };
        }
        const location = result.location;
        if (location.city !== Player.city) {
          return {
            success: false,
            message: `${locationName} is in ${location.city}, but you are currently in ${Player.city}`,
          };
        }
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
      })();
      if (!result.success) {
        helpers.log(ctx, () => result.message);
      }
      return result;
    },
    getState: (ctx) => () => {
      checkAccess(ctx);
      if (!getPlayerLocation(ctx)) {
        return null;
      }
      return getState();
    },
    pressKey: (ctx) => (_key) => {
      checkAccess(ctx);
      const key = helpers.string(ctx, "key", _key);
      const location = getPlayerLocation(ctx);
      if (!location) {
        // Perform a no-op if we're not infiltrating. The lack of delay should
        // help clue people in who are debugging.
        return Promise.resolve();
      }
      // Technically your stats can still change while you are infiltrating,
      // so this does not reflect the same difficulty as the actual infil.
      // Like the quirks with hack and grow, this is considered OK.
      const difficulty = calculateDifficulty(location.infiltrationData.startingSecurityLevel);
      const hasAugment = Player.hasAugmentation(AugmentationName.WKSharmonizer, true);
      const noise = difficulty < 1 ? 0 : 10 * difficulty;
      const delay = (hasAugment ? 0.5 : 1) * (60 + difficulty * 30 + Math.random() * noise);
      return helpers.netscriptDelay(ctx, delay).then(() => {
        InfiltrationKeyEvents.emit(key);
      });
    },
    pressSpace: (ctx) => () => {
      checkAccess(ctx);
      if (!getPlayerLocation(ctx)) {
        return;
      }
      InfiltrationKeyEvents.emit(" ");
    },
    claimRewards: (ctx) => (_faction) => {
      checkAccess(ctx, 2);
      const faction = _faction == null ? null : getEnumHelper("FactionName").nsGetMember(ctx, _faction);
      if (!getPlayerLocation(ctx)) {
        return 0;
      }
      const victory = victoryState.value;
      if (!victory) {
        helpers.log(ctx, () => "The current infiltration is not finished yet.");
        return 0;
      }
      const state = stageState.value?.() as { [k: string]: number } | undefined;
      if (faction == null) {
        const money = state?.possibleMoneyGain ?? 0;
        helpers.log(ctx, () => `Sold rewards for ${money === 0 ? "ERROR_UNKNOWN" : formatMoney(money)}`);
        victory.sell();
        return money;
      }
      if (!Player.factions.includes(faction)) {
        helpers.log(ctx, () => `You are not a member of ${faction}!`);
        return 0;
      }
      if (!Factions[faction].getInfo().offersWork()) {
        helpers.log(ctx, () => `You can't use infil to gain rep with ${faction}! (Probably a special faction.)`);
        return 0;
      }
      const rep = state?.possibleRepGain ?? 0;
      helpers.log(
        ctx,
        () => `Traded rewards for ${rep === 0 ? "ERROR_UNKNOWN" : formatReputation(rep)} with ${faction}`,
      );
      victory.tradeToFaction(faction);
      return rep;
    },
    dictionary: (ctx) => () => {
      checkAccess(ctx);
      const words = [...dictionaryWords];
      shuffleArray(words);
      return words;
    },
    adjectives: (ctx) => () => {
      checkAccess(ctx);
      const hasAugment = Player.hasAugmentation(AugmentationName.BeautyOfAphrodite, true);
      const words = hasAugment ? [...negativeAdjectives] : positiveAdjectives.concat(negativeAdjectives);
      shuffleArray(words);
      return hasAugment ? positiveAdjectives.concat(words) : words;
    },
  };
}
