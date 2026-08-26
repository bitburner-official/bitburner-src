import type { Singularity as ISingularity } from "@nsdefs";

import { Player } from "@player";
import { CityName, CompletedProgramName, FactionWorkType, LocationName } from "@enums";
import { purchaseAugmentation, joinFaction, getFactionAugmentationsFiltered } from "../Faction/FactionHelpers";
import { startWorkerScript } from "../NetscriptWorker";
import { Augmentations } from "../Augmentation/Augmentations";
import { getAugCost, installAugmentations, soaAugmentationNames } from "../Augmentation/AugmentationHelpers";
import { CONSTANTS } from "../Constants";
import { RunningScript } from "../Script/RunningScript";
import { calculateAchievements } from "../Achievements/Achievements";
import { CompanyPositions } from "../Company/CompanyPositions";
import { DarkWebItems } from "../DarkWeb/DarkWebItems";
import { Router } from "../ui/GameRoot";
import { Page } from "../ui/Router";
import { SpecialServers } from "../Server/data/SpecialServers";
import { Locations } from "../Locations/Locations";
import { GetServer } from "../Server/AllServers";
import { getEffectiveHackingLevelRequirement, Programs } from "../Programs/Programs";
import { formatMoney, formatRam, formatReputation } from "../ui/formatNumber";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { Companies } from "../Company/Companies";
import { Factions } from "../Faction/Factions";
import { helpers } from "../Netscript/NetscriptHelpers";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { getTorRouter, validateConnections } from "../Server/ServerHelpers";
import { Terminal } from "../Terminal";
import { calculateHackingTime } from "../Hacking";
import { Server } from "../Server/Server";
import { netscriptCanHack } from "../Hacking/netscriptCanHack";
import { FactionInfos } from "../Faction/FactionInfo";
import { donate, favorNeededToDonate } from "../Faction/formulas/donation";
import { InternalAPI, setRemovedFunctions } from "../Netscript/APIWrapper";
import { enterBitNode } from "../RedPill";
import { ClassWork } from "../Work/ClassWork";
import { CreateProgramWork, isCreateProgramWork } from "../Work/CreateProgramWork";
import { FactionWork } from "../Work/FactionWork";
import { CompanyWork } from "../Work/CompanyWork";
import { canGetBonus } from "../ExportBonus";
import { getSaveData, exportGame } from "../SaveObject";
import { calculateCompanyWorkStats, calculateCrimeWorkStats } from "../Work/Formulas";
import { Engine } from "../engine";
import { getEnumHelper } from "../utils/EnumHelper";
import { ScriptFilePath, resolveScriptFilePath } from "../Paths/ScriptFilePath";
import { getRecordEntries } from "../Types/Record";
import { JobTracks } from "../Company/data/JobTracks";
import { ServerConstants } from "../Server/data/Constants";
import { numberOfBlackOperations } from "../Bladeburner/data/BlackOperations";
import { calculateEffectiveRequiredReputation } from "../Company/utils";
import { addRepToFavor } from "../Faction/formulas/favor";
import { validBitNodes } from "../BitNode/Constants";
import { cat } from "../Terminal/commands/cat";
import { Crimes } from "../Crime/Crimes";
import { DarknetServer } from "../Server/DarknetServer";
import { populateDarknet } from "../DarkNet/controllers/NetworkGenerator";
import { deprecationWarning } from "../utils/DeprecationHelper";

export function NetscriptSingularity(): InternalAPI<ISingularity> {
  const runAfterReset = function (cbScript: ScriptFilePath) {
    //Run a script after reset
    if (!cbScript) return;
    const home = Player.getHomeComputer();
    const script = home.scripts.get(cbScript);
    if (!script) return;
    const ramUsage = script.getRamUsage(home.scripts);
    if (!ramUsage) {
      return Terminal.error(`尝试在重置后启动 ${cbScript}，但无法计算 RAM 用量。`);
    }
    const ramAvailable = home.maxRam - home.ramUsed;
    if (ramUsage > ramAvailable + 0.001) {
      return Terminal.error(`尝试在重置后启动 ${cbScript}，但 RAM 不足。`);
    }
    // Start script with no args and 1 thread (default).
    const runningScriptObj = new RunningScript(script, ramUsage, []);
    startWorkerScript(runningScriptObj, home);
  };

  const singularityAPI: InternalAPI<ISingularity> = {
    getOwnedAugmentations: (ctx, _purchased) => {
      helpers.checkSingularityAccess(ctx);
      const purchased = !!_purchased;
      const res: string[] = [];
      for (let i = 0; i < Player.augmentations.length; ++i) {
        res.push(Player.augmentations[i].name);
      }
      if (purchased) {
        for (let i = 0; i < Player.queuedAugmentations.length; ++i) {
          res.push(Player.queuedAugmentations[i].name);
        }
      }
      return res;
    },
    getOwnedSourceFiles: () => {
      return [...Player.activeSourceFiles]
        .filter(([__, activeLevel]) => {
          return activeLevel > 0;
        })
        .map(([n, lvl]) => ({ n, lvl }));
    },
    getAugmentationFactions: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      const factions = aug.factions.slice();
      if (!Player.gang) {
        return factions;
      }
      const gangFactionName = Player.gang.facName;
      const augmentationListOfGangFaction = getFactionAugmentationsFiltered(Factions[gangFactionName]);
      /**
       * If the gang faction does not offer this augmentation, we need to remove the gang faction from the faction list.
       * Example: "NeuroFlux Governor"
       */
      if (!augmentationListOfGangFaction.includes(augName)) {
        return factions.filter((factionName) => factionName !== gangFactionName);
      }
      /**
       * If the gang faction offers this augmentation, but the faction list does not contain the gang faction, we need
       * to add the gang faction to that list.
       * Example: "The Red Pill" in BN2
       */
      if (augmentationListOfGangFaction.includes(augName) && !factions.includes(gangFactionName)) {
        factions.push(gangFactionName);
        return factions;
      }
      return factions;
    },
    getAugmentationsFromFaction: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const faction = Factions[facName];
      return getFactionAugmentationsFiltered(faction);
    },
    getAugmentationPrereq: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      return aug.prereqs.slice();
    },
    getAugmentationBasePrice: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      // SoA augmentations don't use the bitnode AugmentationMoneyCost multiplier;
      // their cost only scales with the number of SoA augs already owned.
      if (soaAugmentationNames.includes(augName)) {
        return aug.baseCost;
      }
      return aug.baseCost * currentNodeMults.AugmentationMoneyCost;
    },
    getAugmentationPrice: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      return getAugCost(aug).moneyCost;
    },
    getAugmentationRepReq: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      return getAugCost(aug).repCost;
    },
    getAugmentationStats: (ctx, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const aug = Augmentations[augName];
      return Object.assign({}, aug.mults);
    },
    purchaseAugmentation: (ctx, _facName, _augName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const augName = getEnumHelper("AugmentationName").nsGetMember(ctx, _augName);
      const faction = Factions[facName];
      const augmentation = Augmentations[augName];

      const result = purchaseAugmentation(faction, augmentation, true);
      if (!result.success) {
        helpers.log(ctx, () => result.message);
        return false;
      }
      helpers.log(ctx, () => `你已购买 ${augName}。`);
      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain * 10);
      return true;
    },
    softReset: (ctx, _cbScript) => {
      helpers.checkSingularityAccess(ctx);
      const cbScript = _cbScript
        ? resolveScriptFilePath(helpers.string(ctx, "cbScript", _cbScript), ctx.workerScript.name)
        : false;
      if (cbScript === null) throw helpers.errorMessage(ctx, `无法解析文件路径：${_cbScript}`);

      helpers.log(ctx, () => "正在软重置。这将导致本脚本被杀死");
      installAugmentations(true);
      if (cbScript) setTimeout(() => runAfterReset(cbScript), 500);
    },
    installAugmentations: (ctx, _cbScript) => {
      helpers.checkSingularityAccess(ctx);
      const cbScript = _cbScript
        ? resolveScriptFilePath(helpers.string(ctx, "cbScript", _cbScript), ctx.workerScript.name)
        : false;
      if (cbScript === null) throw helpers.errorMessage(ctx, `无法解析文件路径：${_cbScript}`);

      if (Player.queuedAugmentations.length === 0) {
        helpers.log(ctx, () => "你没有任何可安装的强化。");
        return false;
      }
      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain * 10);
      helpers.log(ctx, () => "正在安装强化。这将导致本脚本被杀死");
      installAugmentations();
      if (cbScript) setTimeout(() => runAfterReset(cbScript), 500);
    },

    goToLocation: (ctx, _locationName) => {
      helpers.checkSingularityAccess(ctx);
      const locationName = helpers.string(ctx, "locationName", _locationName);
      const location = Object.values(Locations).find((l) => l.name === locationName);
      if (!location) {
        helpers.log(ctx, () => `没有名为 ${locationName} 的地点`);
        return false;
      }
      if (location.city && Player.city !== location.city) {
        helpers.log(ctx, () => `${Player.city} 中没有名为 ${locationName} 的地点`);
        return false;
      }
      if (location.name === LocationName.TravelAgency) {
        Router.toPage(Page.Travel);
      } else if (location.name === LocationName.WorldStockExchange) {
        Router.toPage(Page.StockMarket);
      } else {
        Router.toPage(Page.Location, { location });
      }
      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain / 50000);
      return true;
    },
    universityCourse: (ctx, _universityName, _className, _focus = true) => {
      helpers.checkSingularityAccess(ctx);
      const universityName = helpers.string(ctx, "universityName", _universityName);
      const classType = getEnumHelper("UniversityClassType").nsGetMember(ctx, _className);
      const focus = !!_focus;
      const wasFocusing = Player.focus;

      switch (universityName) {
        case LocationName.AevumSummitUniversity:
          if (Player.city !== CityName.Aevum) {
            helpers.log(
              ctx,
              () => `你无法在'Summit University'学习，因为你不在'${CityName.Aevum}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.AevumSummitUniversity);
          break;
        case LocationName.Sector12RothmanUniversity:
          if (Player.city !== CityName.Sector12) {
            helpers.log(
              ctx,
              () => `你无法在'Rothman University'学习，因为你不在'${CityName.Sector12}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.Sector12RothmanUniversity);
          break;
        case LocationName.VolhavenZBInstituteOfTechnology:
          if (Player.city !== CityName.Volhaven) {
            helpers.log(
              ctx,
              () => `你无法在'ZB Institute of Technology'学习，因为你不在'${CityName.Volhaven}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.VolhavenZBInstituteOfTechnology);
          break;
        default:
          helpers.log(ctx, () => `无效的大学名称：'${universityName}'。`);
          return false;
      }

      Player.startWork(
        new ClassWork({
          classType,
          location: Player.location,
          singularity: true,
        }),
      );
      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocusing) {
        Router.toPage(Page.Terminal);
      }
      helpers.log(ctx, () => `开始在 ${universityName} 上 ${classType}`);
      return true;
    },

    gymWorkout: (ctx, _gymName, _stat, _focus = true) => {
      helpers.checkSingularityAccess(ctx);
      const gymName = helpers.string(ctx, "gymName", _gymName);
      const classType = getEnumHelper("GymType").nsGetMember(ctx, _stat);
      const focus = !!_focus;
      const wasFocusing = Player.focus;

      switch (gymName) {
        case LocationName.AevumCrushFitnessGym:
          if (Player.city !== CityName.Aevum) {
            helpers.log(
              ctx,
              () =>
                `你无法在'${LocationName.AevumCrushFitnessGym}'锻炼，因为你不在'${CityName.Aevum}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.AevumCrushFitnessGym);
          break;
        case LocationName.AevumSnapFitnessGym:
          if (Player.city !== CityName.Aevum) {
            helpers.log(
              ctx,
              () =>
                `你无法在'${LocationName.AevumSnapFitnessGym}'锻炼，因为你不在'${CityName.Aevum}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.AevumSnapFitnessGym);
          break;
        case LocationName.Sector12IronGym:
          if (Player.city !== CityName.Sector12) {
            helpers.log(
              ctx,
              () =>
                `你无法在'${LocationName.Sector12IronGym}'锻炼，因为你不在'${CityName.Sector12}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.Sector12IronGym);
          break;
        case LocationName.Sector12PowerhouseGym:
          if (Player.city !== CityName.Sector12) {
            helpers.log(
              ctx,
              () =>
                `你无法在'${LocationName.Sector12PowerhouseGym}'锻炼，因为你不在'${CityName.Sector12}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.Sector12PowerhouseGym);
          break;
        case LocationName.VolhavenMilleniumFitnessGym:
          if (Player.city !== CityName.Volhaven) {
            helpers.log(
              ctx,
              () =>
                `你无法在'${LocationName.VolhavenMilleniumFitnessGym}'锻炼，因为你不在'${CityName.Volhaven}'。`,
            );
            return false;
          }
          Player.gotoLocation(LocationName.VolhavenMilleniumFitnessGym);
          break;
        default:
          helpers.log(ctx, () => `无效的健身房名称：${gymName}。gymWorkout() 失败`);
          return false;
      }

      Player.startWork(new ClassWork({ classType, location: Player.location, singularity: true }));
      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocusing) {
        Router.toPage(Page.Terminal);
      }
      helpers.log(ctx, () => `开始在 ${gymName} 训练 ${classType}`);
      return true;
    },

    travelToCity: (ctx, _cityName) => {
      helpers.checkSingularityAccess(ctx);
      const cityName = getEnumHelper("CityName").nsGetMember(ctx, _cityName);

      switch (cityName) {
        case CityName.Aevum:
        case CityName.Chongqing:
        case CityName.Sector12:
        case CityName.NewTokyo:
        case CityName.Ishima:
        case CityName.Volhaven:
          if (!Player.travel(cityName)) {
            helpers.log(ctx, () => "资金不足，无法旅行。");
            return false;
          }
          helpers.log(ctx, () => `已前往 ${cityName}`);
          Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain / 50000);
          return true;
        default:
          throw helpers.errorMessage(ctx, `无效的城市名称：'${cityName}'。`);
      }
    },

    purchaseTor: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      if (Player.hasTorRouter()) {
        helpers.log(ctx, () => "你已经拥有 TOR 路由器！");
        return true;
      }

      if (Player.money < CONSTANTS.TorRouterCost) {
        helpers.log(ctx, () => "你买不起 Tor 路由器。");
        return false;
      }
      Player.loseMoney(CONSTANTS.TorRouterCost, "other");

      getTorRouter();
      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain / 500);
      helpers.log(ctx, () => "你已购买了 Tor 路由器！");
      return true;
    },
    purchaseProgram: (ctx, _programName) => {
      helpers.checkSingularityAccess(ctx);
      const programName = helpers.string(ctx, "programName", _programName).toLowerCase();

      if (!Player.hasTorRouter()) {
        helpers.log(ctx, () => "你没有 TOR 路由器。");
        return false;
      }

      const item = Object.values(DarkWebItems).find((i) => i.program.toLowerCase() === programName);
      if (item == null) {
        helpers.log(ctx, () => `无效的程序名称：'${programName}.`);
        return false;
      }

      if (Player.hasProgram(item.program)) {
        helpers.log(ctx, () => `你已经拥有 '${item.program}' 程序`);
        return true;
      }

      if (Player.money < item.price) {
        helpers.log(ctx, () => `资金不足，无法购买 '${item.program}'。需要 ${formatMoney(item.price)}`);
        return false;
      }

      Player.getHomeComputer().pushProgram(item.program);
      // Cancel if the program is in progress of writing
      if (isCreateProgramWork(Player.currentWork) && Player.currentWork.programName === item.program) {
        Player.finishWork(true);
      }

      Player.loseMoney(item.price, "other");
      helpers.log(
        ctx,
        () => `你已购买了 '${item.program}' 程序。新程序可以在你的家用电脑上找到。`,
      );
      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain / 5000);

      if (item.program === CompletedProgramName.darkscape) {
        populateDarknet();
      }

      return true;
    },
    getCurrentServer: (ctx, _returnOpts) => {
      helpers.checkSingularityAccess(ctx);
      const returnOpts = helpers.hostReturnOptions(_returnOpts);
      const server = Player.getCurrentServer();
      return helpers.returnServerID(server, returnOpts);
    },
    cat: (ctx, _filename) => {
      helpers.checkSingularityAccess(ctx);
      const filename = helpers.string(ctx, "filename", _filename);
      const server = Player.getCurrentServer();
      cat([filename], server);
    },
    connect: (ctx, _host?) => {
      helpers.checkSingularityAccess(ctx);
      const [target] = helpers.getServer(ctx, _host);
      if (target == null) {
        return false;
      }
      const result = validateConnections(Player.getCurrentServer(), [target.hostname]);
      if (!result.success) {
        helpers.log(ctx, () => result.message);
        return false;
      }
      Terminal.connectToServer(result.destination, true);
      return true;
    },
    manualHack: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      const server = Player.getCurrentServer();
      return helpers.hack(ctx, server.hostname, true, null);
    },
    installBackdoor: async (ctx): Promise<void> => {
      helpers.checkSingularityAccess(ctx);
      const baseserver = Player.getCurrentServer();
      if (!(baseserver instanceof Server || baseserver instanceof DarknetServer)) {
        throw helpers.errorMessage(ctx, "无法在此类服务器上安装后门。");
      }
      const server = baseserver;
      const installTime = (calculateHackingTime(server, Player) / 4) * 1000;

      if (server instanceof Server) {
        // No root access or skill level too low
        const canHack = netscriptCanHack(server, "backdoor");
        if (!canHack.res) {
          throw helpers.errorMessage(ctx, canHack.msg || "");
        }
      }

      if (server.backdoorInstalled) {
        helpers.log(
          ctx,
          () =>
            "你已经在此服务器上安装过后门。你可以用 ns.getServer().backdoorInstalled 检查服务器是否已安装后门。",
        );
      }
      helpers.log(
        ctx,
        () => `正在 '${server.hostname}' 上安装后门，耗时 ${convertTimeMsToTimeElapsedString(installTime, true)}`,
      );

      return helpers.netscriptDelay(ctx, installTime).then(function () {
        helpers.log(ctx, () => `已成功在 '${server.hostname}' 上安装后门`);
        server.backdoorInstalled = true;

        if (SpecialServers.WorldDaemon === server.hostname) {
          return Router.toPage(Page.BitVerse, { flume: false, quick: false });
        }
        // Manunally check for faction invites
        Engine.Counters.checkFactionInvitations = 0;
        Engine.checkCounters();
      });
    },
    isFocused: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      return Player.focus;
    },
    setFocus: (ctx, _focus) => {
      helpers.checkSingularityAccess(ctx);
      const focus = !!_focus;
      if (Player.currentWork === null) {
        throw helpers.errorMessage(ctx, "当前没有在工作");
      }

      if (!Player.focus && focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
        return true;
      } else if (Player.focus && !focus) {
        Router.toPage(Page.Terminal);
        return true;
      }
      return false;
    },
    hospitalize: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      Player.hospitalize(true);
    },
    isBusy: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      return Player.currentWork !== null || Router.page() === Page.Infiltration || Router.page() === Page.BitVerse;
    },
    stopAction: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      const wasWorking = Player.currentWork !== null;
      Player.finishWork(true);
      return wasWorking;
    },
    upgradeHomeCores: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      // Check if we're at max cores
      const homeComputer = Player.getHomeComputer();
      if (Player.bitNodeOptions.restrictHomePCUpgrade || homeComputer.cpuCores >= 8) {
        helpers.log(ctx, () => `你的家用电脑已达到最大核心数。`);
        return false;
      }

      const cost = Player.getUpgradeHomeCoresCost();
      if (Player.money < cost) {
        helpers.log(ctx, () => `你的资金不足。需要 ${formatMoney(cost)}`);
        return false;
      }

      homeComputer.cpuCores += 1;
      Player.loseMoney(cost, "servers");

      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain * 2);
      helpers.log(
        ctx,
        () => `为家用电脑购买了额外的核心！现在有 ${homeComputer.cpuCores} 个核心。`,
      );
      return true;
    },
    getUpgradeHomeCoresCost: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      return Player.getUpgradeHomeCoresCost();
    },
    upgradeHomeRam: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      // Check if we're at max RAM
      const homeComputer = Player.getHomeComputer();
      if (
        (Player.bitNodeOptions.restrictHomePCUpgrade && homeComputer.maxRam >= 128) ||
        homeComputer.maxRam >= ServerConstants.HomeComputerMaxRam
      ) {
        helpers.log(ctx, () => `你的家用电脑已达到最大 RAM。`);
        return false;
      }

      const cost = Player.getUpgradeHomeRamCost();
      if (Player.money < cost) {
        helpers.log(ctx, () => `你的资金不足。需要 ${formatMoney(cost)}`);
        return false;
      }

      homeComputer.maxRam *= 2;
      Player.loseMoney(cost, "servers");

      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain * 2);
      helpers.log(
        ctx,
        () => `为家用电脑购买了额外的 RAM！现在有 ${formatRam(homeComputer.maxRam)} 的 RAM。`,
      );
      return true;
    },
    getUpgradeHomeRamCost: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      return Player.getUpgradeHomeRamCost();
    },
    getCompanyPositions: (ctx, _companyName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);

      return getRecordEntries(CompanyPositions)
        .filter((_position) => Companies[companyName].hasPosition(_position[0]))
        .map((_position) => _position[1].name);
    },
    getCompanyPositionInfo: (ctx, _companyName, _positionName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      const positionName = getEnumHelper("JobName").nsGetMember(ctx, _positionName, "positionName");
      const company = Companies[companyName];

      if (!company.hasPosition(positionName)) {
        throw helpers.errorMessage(ctx, `公司 '${companyName}' 没有职位 '${positionName}'`);
      }

      const job = CompanyPositions[positionName];
      const res = {
        name: job.name,
        field: job.field,
        nextPosition: job.nextPosition,
        salary: calculateCompanyWorkStats(Player, company, job, company.favor).money,
        requiredReputation: calculateEffectiveRequiredReputation(companyName, job.requiredReputation),
        requiredSkills: job.requiredSkills(company.jobStatReqOffset),
      };
      return res;
    },
    workForCompany: (ctx, _companyName, _focus = true) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      const focus = !!_focus;

      const jobName = Player.jobs[companyName];
      // Make sure player is actually employed at the company
      if (!jobName) {
        throw helpers.errorMessage(ctx, `你没有在这家公司工作：'${companyName}'`);
      }

      const wasFocused = Player.focus;

      Player.startWork(
        new CompanyWork({
          singularity: true,
          companyName: companyName,
        }),
      );
      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocused) {
        Router.toPage(Page.Terminal);
      }
      helpers.log(ctx, () => `开始在 '${companyName}' 工作，职位为 '${jobName}'`);
      return true;
    },
    applyToCompany: (ctx, _companyName, _field) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      const field = getEnumHelper("JobField").nsGetMember(ctx, _field, "field");
      const company = Companies[companyName];
      const entryPos = CompanyPositions[JobTracks[field][0]];

      const result = Player.applyForJob(company, entryPos);
      if (!result.success) {
        helpers.log(
          ctx,
          () =>
            `你未能在 '${companyName}' 的 '${field}' 领域获得新工作/晋升。原因：${result.message}`,
        );
        return null;
      }
      helpers.log(ctx, () => `你在 '${companyName}' 获得了一份新工作，职位为 '${result.jobName}'。`);
      return result.jobName;
    },
    quitJob: (ctx, _companyName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      Player.quitJob(companyName, true);
    },
    getCompanyRep: (ctx, _companyName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      return Companies[companyName].playerReputation;
    },
    getCompanyFavor: (ctx, _companyName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      return Companies[companyName].favor;
    },
    getCompanyFavorGain: (ctx, _companyName) => {
      helpers.checkSingularityAccess(ctx);
      const companyName = getEnumHelper("CompanyName").nsGetMember(ctx, _companyName);
      const company = Companies[companyName];
      return addRepToFavor(company.favor, company.playerReputation) - company.favor;
    },
    getFactionInviteRequirements: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const fac = Factions[facName];
      return [...fac.getInfo().inviteReqs].map((condition) => condition.toJSON());
    },
    getFactionEnemies: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const fac = Factions[facName];
      return fac.getInfo().enemies.slice();
    },
    checkFactionInvitations: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      // Manually trigger a check for faction invites
      Engine.Counters.checkFactionInvitations = 0;
      Engine.checkCounters();
      // Make a copy of player.factionInvitations
      return Player.factionInvitations.slice();
    },
    joinFaction: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);

      if (Player.factions.includes(facName)) {
        helpers.log(ctx, () => `你已经是派系 '${facName}' 的成员了`);
        return false;
      }

      if (!Player.factionInvitations.includes(facName)) {
        helpers.log(ctx, () => `你没有收到派系 '${facName}' 的邀请`);
        return false;
      }
      const fac = Factions[facName];
      joinFaction(fac);

      Player.gainIntelligenceExp(CONSTANTS.IntelligenceSingFnBaseExpGain * 5);
      helpers.log(ctx, () => `已加入 '${facName}' 派系。`);
      return true;
    },
    workForFaction: (ctx, _facName, _type, _focus = true) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const type = getEnumHelper("FactionWorkType").nsGetMember(ctx, _type);
      const focus = !!_focus;
      const faction = Factions[facName];

      // if the player is in a gang and the target faction is any of the gang faction, fail
      if (Player.gang && faction.name === Player.getGangFaction().name) {
        helpers.log(ctx, () => `你无法为 '${facName}' 工作，因为你正在为它管理帮派`);
        return false;
      }

      if (!Player.factions.includes(facName)) {
        helpers.log(ctx, () => `你不是 '${facName}' 的成员`);
        return false;
      }

      const wasFocusing = Player.focus;

      switch (type) {
        case FactionWorkType.hacking:
          if (!FactionInfos[faction.name].offerHackingWork) {
            helpers.log(ctx, () => `派系 '${faction.name}' 不需要黑客合约方面的帮助。`);
            return false;
          }
          Player.startWork(
            new FactionWork({
              singularity: true,
              factionWorkType: FactionWorkType.hacking,
              faction: faction.name,
            }),
          );
          if (focus) {
            Player.startFocusing();
            Router.toPage(Page.Work);
          } else if (wasFocusing) {
            Router.toPage(Page.Terminal);
          }
          helpers.log(ctx, () => `开始为 '${faction.name}' 执行黑客合约`);
          return true;
        case FactionWorkType.field:
          if (!FactionInfos[faction.name].offerFieldWork) {
            helpers.log(ctx, () => `派系 '${faction.name}' 不需要野外任务方面的帮助。`);
            return false;
          }
          Player.startWork(
            new FactionWork({
              singularity: true,
              factionWorkType: FactionWorkType.field,
              faction: faction.name,
            }),
          );
          if (focus) {
            Player.startFocusing();
            Router.toPage(Page.Work);
          } else if (wasFocusing) {
            Router.toPage(Page.Terminal);
          }
          helpers.log(ctx, () => `开始为 '${faction.name}' 执行野外任务`);
          return true;
        case FactionWorkType.security:
          if (!FactionInfos[faction.name].offerSecurityWork) {
            helpers.log(ctx, () => `派系 '${faction.name}' 不需要安保工作方面的帮助。`);
            return false;
          }
          Player.startWork(
            new FactionWork({
              singularity: true,
              factionWorkType: FactionWorkType.security,
              faction: faction.name,
            }),
          );
          if (focus) {
            Player.startFocusing();
            Router.toPage(Page.Work);
          } else if (wasFocusing) {
            Router.toPage(Page.Terminal);
          }
          helpers.log(ctx, () => `开始为 '${faction.name}' 执行安保工作`);
          return true;
        default:
          helpers.log(ctx, () => `无效的工作类型：'${type}`);
          return false;
      }
    },
    getFactionWorkTypes: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      // Gang does not offer normal work.
      if (Player.gang?.facName === facName) {
        return [];
      }
      const factionInfo = Factions[facName].getInfo();
      const workTypes = [];
      if (factionInfo.offerHackingWork) {
        workTypes.push(FactionWorkType.hacking);
      }
      if (factionInfo.offerFieldWork) {
        workTypes.push(FactionWorkType.field);
      }
      if (factionInfo.offerSecurityWork) {
        workTypes.push(FactionWorkType.security);
      }
      return workTypes;
    },
    getFactionRep: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const faction = Factions[facName];
      return faction.playerReputation;
    },
    getFactionFavor: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const faction = Factions[facName];
      return faction.favor;
    },
    getFactionFavorGain: (ctx, _facName) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const faction = Factions[facName];
      return addRepToFavor(faction.favor, faction.playerReputation) - faction.favor;
    },
    donateToFaction: (ctx, _facName, _amt) => {
      helpers.checkSingularityAccess(ctx);
      const facName = getEnumHelper("FactionName").nsGetMember(ctx, _facName);
      const amt = helpers.number(ctx, "amt", _amt);
      const faction = Factions[facName];
      if (!Player.factions.includes(faction.name)) {
        helpers.log(ctx, () => `你无法向 '${facName}' 捐款，因为你不是它的成员`);
        return false;
      }
      if (Player.gang && faction.name === Player.getGangFaction().name) {
        helpers.log(ctx, () => `你无法向 '${facName}' 捐款，因为你正在为它管理帮派`);
        return false;
      }
      if (!faction.getInfo().offersWork()) {
        helpers.log(ctx, () => `你无法向 '${facName}' 捐款，因为该派系不提供任何类型的工作`);
        return false;
      }
      if (typeof amt !== "number" || amt <= 0 || isNaN(amt)) {
        helpers.log(ctx, () => `无效的捐款金额：'${amt}'。`);
        return false;
      }
      if (Player.money < amt) {
        helpers.log(ctx, () => `你没有足够的资金向 '${facName}' 捐款 ${formatMoney(amt)}`);
        return false;
      }

      if (faction.favor < favorNeededToDonate()) {
        helpers.log(
          ctx,
          () =>
            `你的恩惠不足以向该派系捐款。当前 ${
              faction.favor
            }，需要 ${favorNeededToDonate()}`,
        );
        return false;
      }
      const repGain = donate(amt, faction);
      helpers.log(ctx, () => `已向 '${facName}' 捐款 ${formatMoney(amt)}，获得 ${formatReputation(repGain)} 声望`);
      return true;
    },
    createProgram: (ctx, _programName, _focus = true) => {
      helpers.checkSingularityAccess(ctx);
      const programName = helpers.string(ctx, "programName", _programName).toLowerCase();
      const focus = !!_focus;

      const wasFocusing = Player.focus;

      const p = Object.values(Programs).find((p) => p.name.toLowerCase() === programName);

      if (p == null) {
        helpers.log(ctx, () => `指定的程序不存在：'${programName}'`);
        return false;
      }

      if (Player.hasProgram(p.name)) {
        helpers.log(ctx, () => `你已经拥有 '${p.name}' 程序`);
        return false;
      }

      const create = p.create;
      if (create === null) {
        helpers.log(ctx, () => `你无法创建 '${p.name}' 程序`);
        return false;
      }

      if (!create.req()) {
        helpers.log(ctx, () => `黑客等级过低，无法创建 '${p.name}'（需要等级 ${create.level}）`);
        return false;
      }
      if (Player.currentWork) {
        Player.finishWork(true);
      }

      Player.startWork(
        new CreateProgramWork({
          programName: p.name,
          singularity: true,
        }),
      );
      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocusing) {
        Router.toPage(Page.Terminal);
      }
      helpers.log(ctx, () => `开始编写程序：'${programName}'`);
      return true;
    },
    getHackingLevelRequirementOfProgram: (ctx, _programName) => {
      helpers.checkSingularityAccess(ctx);
      const programName = helpers.string(ctx, "programName", _programName).toLowerCase();

      const program = Object.values(Programs).find((p) => p.name.toLowerCase() === programName);
      if (program == null) {
        throw helpers.errorMessage(ctx, `指定的程序不存在：'${programName}'`);
      }

      const create = program.create;
      // Return Infinity if this program cannot be created.
      if (create === null) {
        return Infinity;
      }

      // The hacking level requirement of bitFlume is exactly 1. It does not depend on Intelligence.
      if (program.name === CompletedProgramName.bitFlume) {
        return 1;
      }

      return getEffectiveHackingLevelRequirement(create.level);
    },
    commitCrime: (ctx, _crimeType, _focus) => {
      helpers.checkSingularityAccess(ctx);
      const crimeType = getEnumHelper("CrimeType").nsGetMember(ctx, _crimeType);
      const focus = _focus === undefined ? true : !!_focus;
      const wasFocusing = Player.focus;

      if (Player.currentWork !== null) {
        Player.finishWork(true);
      }
      Player.gotoLocation(LocationName.Slums);

      const crime = Crimes[crimeType];
      if (crime == null) {
        throw helpers.errorMessage(ctx, `无效的犯罪：'${crimeType}'`);
      }

      helpers.log(ctx, () => `正在尝试实施 ${crime.type}...`);
      const crimeTime = crime.commit(1, ctx.workerScript);
      if (focus) {
        Player.startFocusing();
        Router.toPage(Page.Work);
      } else if (wasFocusing) {
        Router.toPage(Page.Terminal);
      }
      return crimeTime;
    },
    getCrimeChance: (ctx, _crimeType) => {
      helpers.checkSingularityAccess(ctx);
      const crimeType = getEnumHelper("CrimeType").nsGetMember(ctx, _crimeType);

      const crime = Crimes[crimeType];
      if (crime == null) {
        throw helpers.errorMessage(ctx, `无效的犯罪：'${crimeType}'`);
      }

      return crime.successRate(Player);
    },
    getCrimeStats: (ctx, _crimeType) => {
      helpers.checkSingularityAccess(ctx);
      const crimeType = getEnumHelper("CrimeType").nsGetMember(ctx, _crimeType);

      const crime = Crimes[crimeType];
      if (crime == null) {
        throw helpers.errorMessage(ctx, `无效的犯罪：'${crimeType}'`);
      }

      const crimeStatsWithMultipliers = calculateCrimeWorkStats(Player, crime);

      return Object.assign({}, crime, {
        money: crimeStatsWithMultipliers.money,
        reputation: crimeStatsWithMultipliers.reputation,
        hacking_exp: crimeStatsWithMultipliers.hackExp,
        strength_exp: crimeStatsWithMultipliers.strExp,
        defense_exp: crimeStatsWithMultipliers.defExp,
        dexterity_exp: crimeStatsWithMultipliers.dexExp,
        agility_exp: crimeStatsWithMultipliers.agiExp,
        charisma_exp: crimeStatsWithMultipliers.chaExp,
        intelligence_exp: crimeStatsWithMultipliers.intExp,
      });
    },
    getDarkwebPrograms: (ctx) => {
      helpers.checkSingularityAccess(ctx);

      // If we don't have Tor, log it and return [] (empty list)
      if (!Player.hasTorRouter()) {
        helpers.log(ctx, () => "你没有 TOR 路由器。");
        return [];
      }
      return Object.values(DarkWebItems).map((p) => p.program);
    },
    getDarkwebProgramCost: (ctx, _programName) => {
      helpers.checkSingularityAccess(ctx);
      const programName = helpers.string(ctx, "programName", _programName).toLowerCase();

      // If we don't have Tor, log it and return -1
      if (!Player.hasTorRouter()) {
        helpers.log(ctx, () => "你没有 TOR 路由器。");
        // returning -1 rather than throwing an error to be consistent with purchaseProgram
        // which returns false if tor has
        return -1;
      }

      const item = Object.values(DarkWebItems).find((i) => i.program.toLowerCase() === programName);

      // If the program doesn't exist, throw an error. The reasoning here is that the 99% case is that
      // the player will be using this in automation scripts, and if they're asking for a program that
      // doesn't exist, it's the first time they've run the script. So throw an error to let them know
      // that they need to fix it.
      if (item == null) {
        throw helpers.errorMessage(
          ctx,
          `在暗网上找不到此利用程序（'${programName}'）！` +
            `\n此函数不区分大小写。你是否忘了在结尾加上 .exe？`,
        );
      }

      if (Player.hasProgram(item.program)) {
        helpers.log(ctx, () => `你已经拥有 '${item.program}' 程序`);
        return 0;
      }
      return item.price;
    },
    b1tflum3: (ctx, _nextBN, _cbScript, _bitNodeOptions) => {
      helpers.checkSingularityAccess(ctx);
      const nextBN = helpers.number(ctx, "nextBN", _nextBN);
      if (!validBitNodes.includes(nextBN)) {
        throw new Error(`Invalid BitNode: ${_nextBN}.`);
      }
      const cbScript = _cbScript
        ? resolveScriptFilePath(helpers.string(ctx, "cbScript", _cbScript), ctx.workerScript.name)
        : false;
      if (cbScript === null) {
        throw helpers.errorMessage(ctx, `无法解析文件路径。callbackScript 为 null。`);
      }
      const bitNodeOptions = helpers.validateBitNodeOptions(ctx, _bitNodeOptions);
      enterBitNode(true, Player.bitNodeN, nextBN, bitNodeOptions);
      if (cbScript) {
        setTimeout(() => runAfterReset(cbScript), 500);
      }
    },
    destroyW0r1dD43m0n: (ctx, _nextBN, _cbScript, _bitNodeOptions) => {
      helpers.checkSingularityAccess(ctx);
      const nextBN = _nextBN != null ? helpers.number(ctx, "nextBN", _nextBN) : null;
      if (nextBN !== null) {
        // If _nextBN was provided, check that it is a valid BitNode.
        if (!validBitNodes.includes(nextBN)) {
          throw new Error(`Invalid BitNode: ${_nextBN}.`);
        }
      } else if (_cbScript != null || _bitNodeOptions != null) {
        // If _nextBN was not provided, the other parameters must also be nullish.
        throw helpers.errorMessage(ctx, `当 nextBN 为空值时，其他参数也必须为空值。`);
      }
      const cbScript = _cbScript
        ? resolveScriptFilePath(helpers.string(ctx, "cbScript", _cbScript), ctx.workerScript.name)
        : false;
      if (cbScript === null) {
        throw helpers.errorMessage(ctx, `无法解析文件路径。callbackScript 为 null。`);
      }
      const bitNodeOptions = helpers.validateBitNodeOptions(ctx, _bitNodeOptions);

      const wd = GetServer(SpecialServers.WorldDaemon);
      if (!(wd instanceof Server)) {
        throw new Error("WorldDaemon 不是普通服务器。这是一个 bug。请联系开发者。");
      }
      const hackingRequirements = () => {
        if (Player.skills.hacking < wd.requiredHackingSkill || !wd.hasAdminRights) {
          return false;
        }
        return true;
      };
      const bladeburnerRequirements = () => {
        if (!Player.bladeburner) {
          return false;
        }
        return Player.bladeburner.numBlackOpsComplete >= numberOfBlackOperations;
      };

      if (!hackingRequirements() && !bladeburnerRequirements()) {
        helpers.log(ctx, () => "未满足摧毁世界守护进程的条件");
        return;
      }

      wd.backdoorInstalled = true;
      calculateAchievements();
      if (nextBN === null) {
        Router.toPage(Page.BitVerse, { flume: false, quick: false });
        return;
      }
      enterBitNode(false, Player.bitNodeN, nextBN, bitNodeOptions);
      if (cbScript) {
        setTimeout(() => runAfterReset(cbScript), 500);
      }
    },
    getCurrentWork: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      if (!Player.currentWork) return null;
      return Player.currentWork.APICopy();
    },
    getSaveData: async (ctx) => {
      helpers.checkSingularityAccess(ctx);
      const saveData = await getSaveData();
      if (typeof saveData === "string") {
        // saveData is the base64-encoded json save string. A base64-encoded string only uses ASCII characters, so it's
        // fine to use new TextEncoder().encode() to encode it to a Uint8Array.
        return new TextEncoder().encode(saveData);
      }
      // saveData is the compressed json save string.
      return saveData;
    },
    exportGame: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      return exportGame();
    },
    exportGameBonus: (ctx) => {
      deprecationWarning("ns.singularity.exportGameBonus", "Use ns.singularity.hasExportGameBonus instead.");
      return singularityAPI.hasExportGameBonus(ctx);
    },
    hasExportGameBonus: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      return canGetBonus();
    },
    getUnlockedAchievements: (ctx) => {
      helpers.checkSingularityAccess(ctx);
      return Object.values(Player.achievements).map((a) => a.ID);
    },
  };

  // Removed functions
  setRemovedFunctions(singularityAPI, {
    getAugmentationCost: {
      version: "2.2.0",
      replacement: "singularity.getAugmentationPrice and singularity.getAugmentationRepReq",
    },
  });
  return singularityAPI;
}
