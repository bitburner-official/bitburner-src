import { loadAliases, loadGlobalAliases, Aliases, GlobalAliases } from "./Alias";
import { Companies, loadCompanies } from "./Company/Companies";
import { CONSTANTS } from "./Constants";
import { Factions, loadFactions } from "./Faction/Factions";
import { loadAllGangs, AllGangs } from "./Gang/AllGangs";
import { Player, setPlayer, loadPlayer } from "./Player";
import {
  saveAllServers,
  loadAllServers,
  GetAllServers,
  createUniqueRandomIp,
  AddToAllServers,
  GetServer,
} from "./Server/AllServers";
import { Settings } from "./Settings/Settings";
import { loadStockMarket, StockMarket } from "./StockMarket/StockMarket";
import { staneksGift, loadStaneksGift } from "./CotMG/Helper";

import { SnackbarEvents, ToastVariant } from "./ui/React/Snackbar";

import * as ExportBonus from "./ExportBonus";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { Reviver, constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "./utils/JSONReviver";
import { save } from "./db";
import { AwardNFG, v1APIBreak } from "./utils/v1APIBreak";
import { AugmentationNames } from "./Augmentation/data/AugmentationNames";
import { PlayerOwnedAugmentation } from "./Augmentation/PlayerOwnedAugmentation";
import { initAugmentations } from "./Augmentation/AugmentationHelpers";
import { LocationName } from "./Enums";
import { pushGameSaved } from "./Electron";
import { defaultMonacoTheme } from "./ScriptEditor/ui/themes";
import { FactionNames } from "./Faction/data/FactionNames";
import { Faction } from "./Faction/Faction";
import { safelyCreateUniqueServer } from "./Server/ServerHelpers";
import { SpecialServers } from "./Server/data/SpecialServers";
import { v2APIBreak } from "./utils/v2APIBreak";
import { Corporation } from "./Corporation/Corporation";
import { Terminal } from "./Terminal";

/* SaveObject.js
 *  Defines the object used to save/load games
 */

export interface SaveData {
  playerIdentifier: string;
  fileName: string;
  save: string;
  savedOn: number;
}

export interface ImportData {
  base64: string;
  playerData?: ImportPlayerData;
}

export interface ImportPlayerData {
  identifier: string;
  lastSave: number;
  totalPlaytime: number;

  money: number;
  hacking: number;

  augmentations: number;
  factions: number;
  achievements: number;

  bitNode: number;
  bitNodeLevel: number;
  sourceFiles: number;
}

class BitburnerSaveObject {
  PlayerSave = "";
  AllServersSave = "";
  CompaniesSave = "";
  FactionsSave = "";
  AliasesSave = "";
  GlobalAliasesSave = "";
  StockMarketSave = "";
  SettingsSave = "";
  VersionSave = "";
  AllGangsSave = "";
  LastExportBonus = "0";
  StaneksGiftSave = "";

  getSaveString(forceExcludeRunningScripts = false): string {
    this.PlayerSave = JSON.stringify(Player);

    // For the servers save, overwrite the ExcludeRunningScripts setting if forced
    const originalExcludeSetting = Settings.ExcludeRunningScriptsFromSave;
    if (forceExcludeRunningScripts) Settings.ExcludeRunningScriptsFromSave = true;
    this.AllServersSave = saveAllServers();
    Settings.ExcludeRunningScriptsFromSave = originalExcludeSetting;

    this.CompaniesSave = JSON.stringify(Companies);
    this.FactionsSave = JSON.stringify(Factions);
    this.AliasesSave = JSON.stringify(Object.fromEntries(Aliases.entries()));
    this.GlobalAliasesSave = JSON.stringify(Object.fromEntries(GlobalAliases.entries()));
    this.StockMarketSave = JSON.stringify(StockMarket);
    this.SettingsSave = JSON.stringify(Settings);
    this.VersionSave = JSON.stringify(CONSTANTS.VersionNumber);
    this.LastExportBonus = JSON.stringify(ExportBonus.LastExportBonus);
    this.StaneksGiftSave = JSON.stringify(staneksGift);

    if (Player.gang) this.AllGangsSave = JSON.stringify(AllGangs);

    const saveString = btoa(unescape(encodeURIComponent(JSON.stringify(this))));
    return saveString;
  }

  saveGame(emitToastEvent = true): Promise<void> {
    const savedOn = new Date().getTime();
    Player.lastSave = savedOn;
    const saveString = this.getSaveString();
    return new Promise((resolve, reject) => {
      save(saveString)
        .then(() => {
          const saveData: SaveData = {
            playerIdentifier: Player.identifier,
            fileName: this.getSaveFileName(),
            save: saveString,
            savedOn,
          };
          pushGameSaved(saveData);

          if (emitToastEvent) {
            SnackbarEvents.emit("Game Saved!", ToastVariant.INFO, 2000);
          }
          return resolve();
        })
        .catch((err) => {
          console.error(err);
          return reject();
        });
    });
  }

  getSaveFileName(isRecovery = false): string {
    // Save file name is based on current timestamp and BitNode
    const epochTime = Math.round(Date.now() / 1000);
    const bn = Player.bitNodeN;
    let filename = `bitburnerSave_${epochTime}_BN${bn}x${Player.sourceFileLvl(bn) + 1}.json`;
    if (isRecovery) filename = "RECOVERY" + filename;
    return filename;
  }

  exportGame(): void {
    const saveString = this.getSaveString();
    const filename = this.getSaveFileName();
    download(filename, saveString);
  }

  importGame(base64Save: string, reload = true): Promise<void> {
    if (!base64Save || base64Save === "") throw new Error("Invalid import string");
    return save(base64Save).then(() => {
      if (reload) setTimeout(() => location.reload(), 1000);
      return Promise.resolve();
    });
  }

  getImportStringFromFile(files: FileList | null): Promise<string> {
    if (files === null) return Promise.reject(new Error("No file selected"));
    const file = files[0];
    if (!file) return Promise.reject(new Error("Invalid file selected"));

    const reader = new FileReader();
    const promise = new Promise<string>((resolve, reject) => {
      reader.onload = function (this: FileReader, e: ProgressEvent<FileReader>) {
        const target = e.target;
        if (target === null) {
          return reject(new Error("Error importing file"));
        }
        const result = target.result;
        if (typeof result !== "string") {
          return reject(new Error("FileReader event was not type string"));
        }
        const contents = result;
        resolve(contents);
      };
    });
    reader.readAsText(file);
    return promise;
  }

  async getImportDataFromString(base64Save: string): Promise<ImportData> {
    if (!base64Save || base64Save === "") throw new Error("Invalid import string");

    let newSave;
    try {
      newSave = window.atob(base64Save);
      newSave = newSave.trim();
    } catch (error) {
      console.error(error); // We'll handle below
    }

    if (!newSave || newSave === "") {
      return Promise.reject(new Error("Save game had not content or was not base64 encoded"));
    }

    let parsedSave;
    try {
      parsedSave = JSON.parse(newSave);
    } catch (error) {
      console.error(error); // We'll handle below
    }

    if (!parsedSave || parsedSave.ctor !== "BitburnerSaveObject" || !parsedSave.data) {
      return Promise.reject(new Error("Save game did not seem valid"));
    }

    const data: ImportData = {
      base64: base64Save,
    };

    const importedPlayer = loadPlayer(parsedSave.data.PlayerSave);

    const playerData: ImportPlayerData = {
      identifier: importedPlayer.identifier,
      lastSave: importedPlayer.lastSave,
      totalPlaytime: importedPlayer.totalPlaytime,

      money: importedPlayer.money,
      hacking: importedPlayer.skills.hacking,

      augmentations: importedPlayer.augmentations?.reduce<number>((total, current) => (total += current.level), 0) ?? 0,
      factions: importedPlayer.factions?.length ?? 0,
      achievements: importedPlayer.achievements?.length ?? 0,

      bitNode: importedPlayer.bitNodeN,
      bitNodeLevel: importedPlayer.sourceFileLvl(Player.bitNodeN) + 1,
      sourceFiles: [...importedPlayer.sourceFiles].reduce<number>((total, [__bn, lvl]) => (total += lvl), 0),
    };

    data.playerData = playerData;
    return Promise.resolve(data);
  }

  toJSON(): IReviverValue {
    return Generic_toJSON("BitburnerSaveObject", this);
  }

  static fromJSON(value: IReviverValue): BitburnerSaveObject {
    return Generic_fromJSON(BitburnerSaveObject, value.data);
  }
}

/** Function for performing a series of defined replacements. See 0.58.0 for usage */
function convert(code: string, changes: [RegExp, string][]): string {
  for (const change of changes) {
    code = code.replace(change[0], change[1]);
  }
  return code;
}

// Makes necessary changes to the loaded/imported data to ensure
// the game stills works with new versions
function evaluateVersionCompatibility(ver: string | number): void {
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

      // The "companyName" property of all Companies is renamed to "name"
      interface Company0_41_2 {
        name: string | number;
        companyName: string;
        companyPositions: Record<number, boolean>;
      }
      for (const companyName of Object.keys(Companies)) {
        const company = Companies[companyName] as unknown as Company0_41_2;
        if (company.name == 0 && company.companyName != null) {
          company.name = company.companyName;
        }

        if (company.companyPositions instanceof Array) {
          const pos: Record<number, boolean> = {};

          for (let i = 0; i < company.companyPositions.length; ++i) {
            pos[company.companyPositions[i]] = true;
          }
          company.companyPositions = pos;
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
    initAugmentations();
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
    Factions[FactionNames.ShadowsOfAnarchy] = new Faction(FactionNames.ShadowsOfAnarchy);
    //Iterate over all contracts on all servers
    for (const server of GetAllServers()) {
      for (const contract of server.contracts) {
        //Rename old "HammingCodes: Integer to encoded Binary" contracts
        //to "HammingCodes: Integer to Encoded Binary"
        if (contract.type == "HammingCodes: Integer to encoded Binary") {
          contract.type = "HammingCodes: Integer to Encoded Binary";
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
    ownedNFGs = ownedNFGs.filter((aug) => aug.name === AugmentationNames.NeuroFluxGovernor);
    const newNFG = new PlayerOwnedAugmentation(AugmentationNames.NeuroFluxGovernor);
    newNFG.level = 0;

    for (const nfg of ownedNFGs) {
      newNFG.level += nfg.level;
    }

    Player.augmentations = [
      ...Player.augmentations.filter((aug) => aug.name !== AugmentationNames.NeuroFluxGovernor),
      newNFG,
    ];

    v22PlayerBreak();
    initAugmentations();
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
      delete anyPlayer[field];
    }
    for (const sleeve of anyPlayer.sleeves) {
      const anySleeve = sleeve;
      let intExp = Number(anySleeve.intelligence_exp);
      if (isNaN(intExp)) intExp = 0;
      anySleeve.exp.intelligence += intExp;
      for (const field of removeSleeveFields) {
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
    const oldCorp = anyPlayer.corporation as Corporation | null | 0;
    if (oldCorp && Array.isArray(oldCorp.divisions)) {
      // Corp needs to be reset to new format, just keep some valuation data
      let valuation = oldCorp.valuation * 2 + oldCorp.revenue * 100;
      if (isNaN(valuation)) valuation = 300e9;
      Player.startCorporation(String(oldCorp.name), !!oldCorp.seedFunded);
      Player.corporation?.addFunds(valuation);
      Terminal.warn("Loading corporation from version prior to 2.3. Corporation has been reset.");
    }
    // End 2.3 changes
  }
  //2.3 hotfix changes and 2.3.1 changes
  if (ver < 32) {
    // Due to a bug from before 2.3, some scripts have the wrong server listed. In 2.3 this caused issues.
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
}

function loadGame(saveString: string): boolean {
  createScamUpdateText();
  if (!saveString) return false;
  saveString = decodeURIComponent(escape(atob(saveString)));

  const saveObj = JSON.parse(saveString, Reviver);

  setPlayer(loadPlayer(saveObj.PlayerSave));
  loadAllServers(saveObj.AllServersSave);
  loadCompanies(saveObj.CompaniesSave);
  loadFactions(saveObj.FactionsSave);

  if (Object.hasOwn(saveObj, "StaneksGiftSave")) {
    loadStaneksGift(saveObj.StaneksGiftSave);
  } else {
    console.warn(`Could not load Staneks Gift from save`);
    loadStaneksGift("");
  }
  if (Object.hasOwn(saveObj, "AliasesSave")) {
    try {
      loadAliases(saveObj.AliasesSave);
    } catch (e) {
      console.warn(`Could not load Aliases from save`);
      loadAliases("");
    }
  } else {
    console.warn(`Save file did not contain an Aliases property`);
    loadAliases("");
  }
  if (Object.hasOwn(saveObj, "GlobalAliasesSave")) {
    try {
      loadGlobalAliases(saveObj.GlobalAliasesSave);
    } catch (e) {
      console.warn(`Could not load GlobalAliases from save`);
      loadGlobalAliases("");
    }
  } else {
    console.warn(`Save file did not contain a GlobalAliases property`);
    loadGlobalAliases("");
  }
  if (Object.hasOwn(saveObj, "StockMarketSave")) {
    try {
      loadStockMarket(saveObj.StockMarketSave);
    } catch (e) {
      console.error("Couldn't load stock market:", e);
      loadStockMarket("");
    }
  } else {
    loadStockMarket("");
  }
  if (Object.hasOwn(saveObj, "SettingsSave")) {
    try {
      // Try to set saved settings.
      Settings.load(saveObj.SettingsSave);
    } catch (e) {
      console.error("SettingsSave was present but an error occurred while loading:");
      console.error(e);
    }
  }
  if (Object.hasOwn(saveObj, "LastExportBonus")) {
    try {
      ExportBonus.setLastExportBonus(JSON.parse(saveObj.LastExportBonus));
    } catch (err) {
      ExportBonus.setLastExportBonus(new Date().getTime());
      console.error("ERROR: Failed to parse last export bonus Settings " + err);
    }
  }
  if (Player.gang && Object.hasOwn(saveObj, "AllGangsSave")) {
    try {
      loadAllGangs(saveObj.AllGangsSave);
    } catch (e) {
      console.error("ERROR: Failed to parse AllGangsSave: " + e);
    }
  }
  if (Object.hasOwn(saveObj, "VersionSave")) {
    try {
      const ver = JSON.parse(saveObj.VersionSave, Reviver);
      evaluateVersionCompatibility(ver);
      if (CONSTANTS.isDevBranch) {
        // Beta branch, always show changes
        createBetaUpdateText();
      } else if (ver !== CONSTANTS.VersionNumber) {
        createNewUpdateText();
      }
    } catch (e) {
      console.error("Error upgrading versions:", e);
      createNewUpdateText();
    }
  } else {
    createNewUpdateText();
  }
  return true;
}

function createScamUpdateText(): void {
  if (navigator.userAgent.includes("wv") && navigator.userAgent.includes("Chrome/")) {
    setInterval(() => {
      dialogBoxCreate("SCAM ALERT. This app is not official and you should uninstall it.");
    }, 1000);
  }
}

function createNewUpdateText() {
  setTimeout(
    () =>
      dialogBoxCreate(
        "New update!\n" +
          "Please report any bugs/issues through the GitHub repository " +
          "or the Bitburner subreddit (reddit.com/r/bitburner).\n\n" +
          CONSTANTS.LatestUpdate,
      ),
    1000,
  );
}

function createBetaUpdateText() {
  setTimeout(
    () =>
      dialogBoxCreate(
        "You are playing on the beta environment! This branch of the game " +
          "features the latest developments in the game. This version may be unstable.\n" +
          "Please report any bugs/issues through the github repository (https://github.com/bitburner-official/bitburner-src/issues) " +
          "or the Bitburner subreddit (reddit.com/r/bitburner).\n\n" +
          CONSTANTS.LatestUpdate,
      ),
    1000,
  );
}

function download(filename: string, content: string): void {
  const file = new Blob([content], { type: "text/plain" });

  const a = document.createElement("a"),
    url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

constructorsForReviver.BitburnerSaveObject = BitburnerSaveObject;

export { saveObject, loadGame, download };

const saveObject = new BitburnerSaveObject();
