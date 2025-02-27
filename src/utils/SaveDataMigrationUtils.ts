/**
 * This file contains utility functions that migrate save data. Originally, they were in SaveObject.ts. It's too hard to
 * satisfy all TypeScript's type checks, so we move them into a separate helper file, then disable some lint rules in
 * the entire file. It helps us:
 * - Not have to disable lint rules in SaveObject.ts.
 * - Not have to use "// eslint-disable-next-line" everywhere in these functions.
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Player } from "@player";
import { AugmentationName, CodingContractName, LocationName } from "@enums";
import { AddToAllServers, createUniqueRandomIp, GetAllServers, GetServer, renameServer } from "../Server/AllServers";
import { StockMarket } from "../StockMarket/StockMarket";
import { AwardNFG, v1APIBreak } from "./v1APIBreak";
import { Settings } from "../Settings/Settings";
import { defaultMonacoTheme } from "../ScriptEditor/ui/themes";
import { PlayerOwnedAugmentation } from "../Augmentation/PlayerOwnedAugmentation";
import { SpecialServers } from "../Server/data/SpecialServers";
import { safelyCreateUniqueServer } from "../Server/ServerHelpers";
import { v2APIBreak } from "./v2APIBreak";
import { Terminal } from "../Terminal";
import { getRecordValues } from "../Types/Record";
import { ServerName } from "../Types/strings";
import { ContentFilePath, ContentFile, ContentFileMap } from "../Paths/ContentFile";
import { exportMaterial } from "../Corporation/Actions";
import { getGoSave, loadGo } from "../Go/SaveLoad";
import { showAPIBreaks } from "./APIBreaks/APIBreak";
import { breakInfos261 } from "./APIBreaks/2.6.1";

/** Function for performing a series of defined replacements. See 0.58.0 for usage */
function convert(code: string, changes: [RegExp, string][]): string {
  for (const change of changes) {
    code = code.replace(change[0], change[1]);
  }
  return code;
}

/** Function for removing whitespace from filenames. See 41 for usage */
function removeWhitespace(hostname: ServerName, file: ContentFile, files: ContentFileMap): void {
  let filename = file.filename.replace(/\s+/g, "-") as ContentFilePath;
  // avoid filename conflicts
  if (files.has(filename)) {
    const idx = filename.lastIndexOf(".");
    const path = filename.slice(0, idx);
    const ext = filename.slice(idx);
    let i = 1;
    do {
      filename = `${path}-${i++}${ext}` as ContentFilePath;
    } while (files.has(filename));
  }
  console.warn(`Renamed "${file.filename}" to "${filename}" on ${hostname}.`);
  files.delete(file.filename);
  file.filename = filename;
  files.set(file.filename, file);
}

// Makes necessary changes to the loaded/imported data to ensure
// the game stills works with new versions
export function evaluateVersionCompatibility(ver: string | number): void {
  // We have to do this because ts won't let us otherwise
  const anyPlayer = Player as any;
  if (typeof ver === "string") {
    // This version refactored the Company/job-related code
    if (ver <= "0.41.2") {
      // Player's company position is now a string
      if (anyPlayer.companyPosition != null && typeof anyPlayer.companyPosition !== "string") {
        anyPlayer.companyPosition = anyPlayer.companyPosition.data.positionName;
        if (anyPlayer.companyPosition == null) {
          anyPlayer.companyPosition = "";
        }
      }
    }

    // This version allowed players to hold multiple jobs
    if (ver < "0.43.0") {
      if (anyPlayer.companyName !== "" && anyPlayer.companyPosition != null && anyPlayer.companyPosition !== "") {
        anyPlayer.jobs[anyPlayer.companyName] = anyPlayer.companyPosition;
      }

      delete anyPlayer.companyPosition;
    }
    if (ver < "0.56.0") {
      // In older versions, keys of AllServers are IP addresses instead of hostnames.
      for (const server of GetAllServers()) {
        renameServer(server.ip, server.hostname);
      }
      for (const q of anyPlayer.queuedAugmentations) {
        if (q.name === "Graphene BranchiBlades Upgrade") {
          q.name = "Graphene BrachiBlades Upgrade";
        }
      }
      for (const q of anyPlayer.augmentations) {
        if (q.name === "Graphene BranchiBlades Upgrade") {
          q.name = "Graphene BrachiBlades Upgrade";
        }
      }
    }
    if (ver < "0.56.1") {
      if (anyPlayer.bladeburner === 0) {
        anyPlayer.bladeburner = null;
      }
      if (anyPlayer.gang === 0) {
        anyPlayer.gang = null;
      }
      // convert all Messages to just filename to save space.
      const home = anyPlayer.getHomeComputer();
      for (let i = 0; i < home.messages.length; i++) {
        if (home.messages[i].filename) {
          home.messages[i] = home.messages[i].filename;
        }
      }
    }
    if (ver < "0.58.0") {
      const changes: [RegExp, string][] = [
        [/getStockSymbols/g, "stock.getSymbols"],
        [/getStockPrice/g, "stock.getPrice"],
        [/getStockAskPrice/g, "stock.getAskPrice"],
        [/getStockBidPrice/g, "stock.getBidPrice"],
        [/getStockPosition/g, "stock.getPosition"],
        [/getStockMaxShares/g, "stock.getMaxShares"],
        [/getStockPurchaseCost/g, "stock.getPurchaseCost"],
        [/getStockSaleGain/g, "stock.getSaleGain"],
        [/buyStock/g, "stock.buy"],
        [/sellStock/g, "stock.sell"],
        [/shortStock/g, "stock.short"],
        [/sellShort/g, "stock.sellShort"],
        [/placeOrder/g, "stock.placeOrder"],
        [/cancelOrder/g, "stock.cancelOrder"],
        [/getOrders/g, "stock.getOrders"],
        [/getStockVolatility/g, "stock.getVolatility"],
        [/getStockForecast/g, "stock.getForecast"],
        [/purchase4SMarketData/g, "stock.purchase4SMarketData"],
        [/purchase4SMarketDataTixApi/g, "stock.purchase4SMarketDataTixApi"],
      ];
      for (const server of GetAllServers()) {
        for (const script of server.scripts.values()) {
          script.content = convert(script.code, changes);
        }
      }
    }
    v1APIBreak();
    ver = 1;
  }
  if (typeof ver !== "number") return;
  if (ver < 2) {
    AwardNFG(10);
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
  }
  if (ver < 3) {
    anyPlayer.money = parseFloat(anyPlayer.money);
  }
  if (ver < 9) {
    if (Object.hasOwn(StockMarket, "Joes Guns")) {
      const s = StockMarket["Joes Guns"];
      delete StockMarket["Joes Guns"];
      StockMarket[LocationName.Sector12JoesGuns] = s;
    }
  }
  if (ver < 10) {
    // Augmentation name was changed in 0.56.0 but sleeves aug list was missed.
    if (anyPlayer.sleeves && anyPlayer.sleeves.length > 0) {
      for (const sleeve of anyPlayer.sleeves) {
        if (!sleeve.augmentations || sleeve.augmentations.length === 0) continue;
        for (const augmentation of sleeve.augmentations) {
          if (augmentation.name !== "Graphene BranchiBlades Upgrade") continue;
          augmentation.name = "Graphene BrachiBlades Upgrade";
        }
      }
    }
  }
  if (ver < 12) {
    if (anyPlayer.resleeves !== undefined) {
      delete anyPlayer.resleeves;
    }
  }

  if (ver < 15) {
    Settings.EditorTheme = { ...defaultMonacoTheme };
  }
  //Fix contract names
  if (ver < 16) {
    //Iterate over all contracts on all servers
    for (const server of GetAllServers()) {
      for (const contract of server.contracts) {
        //Rename old "HammingCodes: Integer to encoded Binary" contracts
        //to "HammingCodes: Integer to Encoded Binary"
        if ((contract.type as string) == "HammingCodes: Integer to encoded Binary") {
          contract.type = CodingContractName.HammingCodesIntegerToEncodedBinary;
        }
      }
    }
  }

  const v22PlayerBreak = () => {
    // reset HP correctly to avoid crash
    anyPlayer.hp = { current: 1, max: 1 };
    for (const sleeve of anyPlayer.sleeves) {
      sleeve.hp = { current: 1, max: 1 };
    }

    // transfer over old exp to new struct
    anyPlayer.exp.hacking = anyPlayer.hacking_exp;
    anyPlayer.exp.strength = anyPlayer.strength_exp;
    anyPlayer.exp.defense = anyPlayer.defense_exp;
    anyPlayer.exp.dexterity = anyPlayer.dexterity_exp;
    anyPlayer.exp.agility = anyPlayer.agility_exp;
    anyPlayer.exp.charisma = anyPlayer.charisma_exp;
    anyPlayer.exp.intelligence = anyPlayer.intelligence_exp;
  };

  // Fix bugged NFG accumulation in owned augmentations
  if (ver < 17) {
    let ownedNFGs = [...Player.augmentations];
    ownedNFGs = ownedNFGs.filter((aug) => aug.name === AugmentationName.NeuroFluxGovernor);
    const newNFG = new PlayerOwnedAugmentation(AugmentationName.NeuroFluxGovernor);
    newNFG.level = 0;

    for (const nfg of ownedNFGs) {
      newNFG.level += nfg.level;
    }

    Player.augmentations = [
      ...Player.augmentations.filter((aug) => aug.name !== AugmentationName.NeuroFluxGovernor),
      newNFG,
    ];

    v22PlayerBreak();
    Player.reapplyAllAugmentations();
    Player.reapplyAllSourceFiles();
  }

  if (ver < 20) {
    // Create the darkweb for everyone but it won't be linked
    const dw = GetServer(SpecialServers.DarkWeb);
    if (!dw) {
      const darkweb = safelyCreateUniqueServer({
        ip: createUniqueRandomIp(),
        hostname: SpecialServers.DarkWeb,
        organizationName: "",
        isConnectedTo: false,
        adminRights: false,
        purchasedByPlayer: false,
        maxRam: 1,
      });
      AddToAllServers(darkweb);
    }
  }
  if (ver < 21) {
    // 2.0.0 work rework
    AwardNFG(10);
    const create = anyPlayer.createProgramName;
    if (create) Player.getHomeComputer().pushProgram(create);
    const graft = anyPlayer.graftAugmentationName;
    if (graft) Player.augmentations.push({ name: graft, level: 1 });
  }
  if (ver < 22) {
    v22PlayerBreak();
    v2APIBreak();
  }
  if (ver < 23) {
    anyPlayer.currentWork = null;
  }
  if (ver < 25) {
    const removePlayerFields = [
      "hacking_chance_mult",
      "hacking_speed_mult",
      "hacking_money_mult",
      "hacking_grow_mult",
      "hacking_mult",
      "strength_mult",
      "defense_mult",
      "dexterity_mult",
      "agility_mult",
      "charisma_mult",
      "hacking_exp_mult",
      "strength_exp_mult",
      "defense_exp_mult",
      "dexterity_exp_mult",
      "agility_exp_mult",
      "charisma_exp_mult",
      "company_rep_mult",
      "faction_rep_mult",
      "crime_money_mult",
      "crime_success_mult",
      "work_money_mult",
      "hacknet_node_money_mult",
      "hacknet_node_purchase_cost_mult",
      "hacknet_node_ram_cost_mult",
      "hacknet_node_core_cost_mult",
      "hacknet_node_level_cost_mult",
      "bladeburner_max_stamina_mult",
      "bladeburner_stamina_gain_mult",
      "bladeburner_analysis_mult",
      "bladeburner_success_chance_mult",
      "hacking_exp",
      "strength_exp",
      "defense_exp",
      "dexterity_exp",
      "agility_exp",
      "charisma_exp",
      "intelligence_exp",
      "companyName",
      "isWorking",
      "workType",
      "workCostMult",
      "workExpMult",
      "currentWorkFactionName",
      "currentWorkFactionDescription",
      "workHackExpGainRate",
      "workStrExpGainRate",
      "workDefExpGainRate",
      "workDexExpGainRate",
      "workAgiExpGainRate",
      "workChaExpGainRate",
      "workRepGainRate",
      "workMoneyGainRate",
      "workMoneyLossRate",
      "workHackExpGained",
      "workStrExpGained",
      "workDefExpGained",
      "workDexExpGained",
      "workAgiExpGained",
      "workChaExpGained",
      "workRepGained",
      "workMoneyGained",
      "createProgramName",
      "createProgramReqLvl",
      "graftAugmentationName",
      "timeWorkedGraftAugmentation",
      "className",
      "crimeType",
      "timeWorked",
      "timeWorkedCreateProgram",
      "timeNeededToCompleteWork",
      "factionWorkType",
      "committingCrimeThruSingFn",
      "singFnCrimeWorkerScript",
      "hacking",
      "max_hp",
      "strength",
      "defense",
      "dexterity",
      "agility",
      "charisma",
      "intelligence",
    ];
    const removeSleeveFields = [
      "gymStatType",
      "bbAction",
      "bbContract",
      "hacking",
      "strength",
      "defense",
      "dexterity",
      "agility",
      "charisma",
      "intelligence",
      "max_hp",
      "hacking_exp",
      "strength_exp",
      "defense_exp",
      "dexterity_exp",
      "agility_exp",
      "charisma_exp",
      "intelligence_exp",
      "hacking_mult",
      "strength_mult",
      "defense_mult",
      "dexterity_mult",
      "agility_mult",
      "charisma_mult",
      "hacking_exp_mult",
      "strength_exp_mult",
      "defense_exp_mult",
      "dexterity_exp_mult",
      "agility_exp_mult",
      "charisma_exp_mult",
      "hacking_chance_mult",
      "hacking_speed_mult",
      "hacking_money_mult",
      "hacking_grow_mult",
      "company_rep_mult",
      "faction_rep_mult",
      "crime_money_mult",
      "crime_success_mult",
      "work_money_mult",
      "hacknet_node_money_mult",
      "hacknet_node_purchase_cost_mult",
      "hacknet_node_ram_cost_mult",
      "hacknet_node_core_cost_mult",
      "hacknet_node_level_cost_mult",
      "bladeburner_max_stamina_mult",
      "bladeburner_stamina_gain_mult",
      "bladeburner_analysis_mult",
      "bladeburner_success_chance_mult",
      "className",
      "crimeType",
      "currentTask",
      "currentTaskLocation",
      "currentTaskMaxTime",
      "currentTaskTime",
      "earningsForSleeves",
      "earningsForPlayer",
      "earningsForTask",
      "factionWorkType",
      "gainRatesForTask",
      "logs",
    ];
    let intExp = Number(anyPlayer.intelligence_exp);
    if (isNaN(intExp)) intExp = 0;
    anyPlayer.exp.intelligence += intExp;
    for (const field of removePlayerFields) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete anyPlayer[field];
    }
    for (const sleeve of anyPlayer.sleeves) {
      const anySleeve = sleeve;
      let intExp = Number(anySleeve.intelligence_exp);
      if (isNaN(intExp)) intExp = 0;
      anySleeve.exp.intelligence += intExp;
      for (const field of removeSleeveFields) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete sleeve[field];
      }
    }
  }
  if (ver < 27) {
    // Prior to v2.2.0, sleeve shock was 0 to 100 internally but displayed as 100 to 0. This unifies them as 100 to 0.
    for (const sleeve of Player.sleeves) sleeve.shock = 100 - sleeve.shock;
  }
  // Some 2.3 changes are actually in BaseServer.js fromJSONBase function
  if (ver < 31) {
    Terminal.warn("Migrating to 2.3.0, loading with no scripts.");
    for (const server of GetAllServers()) {
      // Do not load any saved scripts on migration
      server.savedScripts = [];
    }
    if (anyPlayer.hashManager?.upgrades) {
      anyPlayer.hashManager.upgrades["Company Favor"] ??= 0;
    }
    if (!anyPlayer.lastAugReset || anyPlayer.lastAugReset === -1) {
      anyPlayer.lastAugReset = anyPlayer.lastUpdate - anyPlayer.playtimeSinceLastAug;
    }
    if (!anyPlayer.lastNodeRest || anyPlayer.lastNodeReset === -1) {
      anyPlayer.lastNodeReset = anyPlayer.lastUpdate - anyPlayer.playtimeSinceLastBitnode;
    }

    // Reset corporation to new format.
    const oldCorp = anyPlayer.corporation;
    if (oldCorp && Array.isArray(oldCorp.divisions)) {
      // Corp needs to be reset to new format, just keep some valuation data
      let valuation = oldCorp.valuation * 2 + oldCorp.revenue * 100;
      if (isNaN(valuation)) valuation = 300e9;
      Player.startCorporation(String(oldCorp.name), !!oldCorp.seedFunded);
      Player.corporation?.gainFunds(valuation, "force majeure");
      Terminal.warn("Loading corporation from version prior to 2.3. Corporation has been reset.");
    }
    // End 2.3 changes
  }
  //2.3 hotfix changes and 2.3.1 changes
  if (ver < 32) {
    // Sanitize corporation exports
    let anyExportsFailed = false;
    if (Player.corporation) {
      for (const division of Player.corporation.divisions.values()) {
        for (const warehouse of getRecordValues(division.warehouses)) {
          for (const material of getRecordValues(warehouse.materials)) {
            const originalExports = material.exports;
            // Clear all exports for the material
            material.exports = [];
            for (const originalExport of originalExports) {
              // Throw if there was a failure re-establishing an export
              try {
                const targetDivision = Player.corporation.divisions.get(originalExport.division);
                if (!targetDivision) throw new Error(`Target division ${originalExport.division} did not exist`);
                // Set the export again. ExportMaterial throws on failure
                exportMaterial(targetDivision, originalExport.city, material, originalExport.amount);
              } catch (e) {
                anyExportsFailed = true;
                // We just need the text error, not a full stack trace
                console.error(
                  `Failed to load export of material ${material.name} (${division.name} ${warehouse.city})
Original export details: ${JSON.stringify(originalExport)}
Error: ${e}`,
                  e,
                );
              }
            }
          }
        }
      }
    }
    if (anyExportsFailed)
      Terminal.error(
        "Some material exports failed to validate while loading and have been removed. See console for more info.",
      );
  }
  if (ver < 33) {
    // 2.4.0 fixed what should be the last issue with scripts having the wrong server assigned
    for (const server of GetAllServers()) {
      for (const script of server.scripts.values()) {
        if (script.server !== server.hostname) {
          console.warn(
            `Detected script ${script.filename} on ${server.hostname} with incorrect server property: ${script.server}. Repairing.`,
          );
          script.server = server.hostname;
        }
      }
    }
  }
  v2_60: if (ver < 38 && "go" in Player) {
    const goData = Player.go;
    // Remove outdated savedata
    delete Player.go;
    // Attempt to load back in at least the stats object. The current game will not be loaded.
    if (!goData || typeof goData !== "object") break v2_60;
    const stats = "status" in goData ? goData.status : "stats" in goData ? goData.stats : null;
    if (!stats || typeof stats !== "object") break v2_60;
    const freshSaveData = getGoSave();
    Object.assign(freshSaveData.stats, stats);
    loadGo(JSON.stringify(freshSaveData));
  }
  if (ver < 39) {
    showAPIBreaks("2.6.1", ...breakInfos261);
  }
  if (ver <= 41) {
    // All whitespace except for spaces was allowed in filenames
    let found = false;
    for (const server of GetAllServers()) {
      for (const script of server.scripts.values()) {
        if (!/\s/.test(script.filename)) continue;
        removeWhitespace(server.hostname, script, server.scripts);
        found = true;
      }
      for (const textFile of server.textFiles.values()) {
        if (!/\s/.test(textFile.filename)) continue;
        removeWhitespace(server.hostname, textFile, server.textFiles);
        found = true;
      }
    }
    if (found) Terminal.error("Filenames with whitespace found and corrected, see console for details.");
  }
}
