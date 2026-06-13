import type { VersionBreakingChange } from "./APIBreak";

export function convertV2GangEquipmentNames(name: string): string {
  switch (name) {
    case "Glock 18C":
      return "Malorian-3516";
    case "P90C":
      return "Hansen-HA7";
    case "Steyr AUG":
      return "Arasaka-HJSH18";
    case "AK-47":
      return "Militech-M251s";
    case "M15A10 Assault Rifle":
      return "Nokota-D5";
    case "AWM Sniper Rifle":
      return "Techtronika-SPT32";
    case "Ford Flex V20":
      return "Herrera Outlaw GTS";
    case "ATX1070 Superbike":
      return "Yaiba ASM-R250 Muramasa";
    case "Mercedes-Benz S9001":
      return "Rayfield Caliburn";
    case "White Ferrari":
      return "Quadra Sport R-7";
    default:
      return name;
  }
}

export const breakingChanges300: VersionBreakingChange = {
  additionalText: "For more information, please check https://github.com/bitburner-official/bitburner-src/issues/2148.",
  apiBreakingChanges: [
    {
      brokenAPIs: [],
      info:
        "You cannot use the deprecated VSCode extension to connect to the Steam app via API server now. You have to " +
        "use Remote API to connect your external editors to Bitburner.\nFor more information, please check the Remote " +
        "API page in the Documentation tab. If you have a question, please ask us on #external-editors on Discord (https://discord.gg/TFc3hKD).",
      showWarning: true,
      doNotSkip: true,
    },
    {
      brokenAPIs: [{ name: "ns.nFormat" }],
      info:
        "ns.nFormat() was removed.\n" +
        "Use ns.format.number, ns.format.ram, ns.format.percent, or JS built-in objects/functions (e.g., Intl.NumberFormat, " +
        "Intl.PluralRules, Intl.Locale) instead.",
      showWarning: true,
    },
    {
      brokenAPIs: [
        {
          name: "ns.getTimeSinceLastAug",
          migration: {
            searchValue: "ns.getTimeSinceLastAug()",
            replaceValue: "(Date.now() - ns.getResetInfo().lastAugReset)",
          },
        },
        {
          name: "ns.getPlayer().playtimeSinceLastAug",
          migration: {
            searchValue: "ns.getPlayer().playtimeSinceLastAug",
            replaceValue: "(Date.now() - ns.getResetInfo().lastAugReset)",
          },
        },
        {
          name: "ns.getPlayer().playtimeSinceLastBitnode",
          migration: {
            searchValue: "ns.getPlayer().playtimeSinceLastBitnode",
            replaceValue: "(Date.now() - ns.getResetInfo().lastNodeReset)",
          },
        },
        {
          name: "ns.getPlayer().bitNodeN",
          migration: {
            searchValue: "ns.getPlayer().bitNodeN",
            replaceValue: "ns.getResetInfo().currentNode",
          },
        },
        {
          name: "ns.corporation.getCorporation().state",
          migration: {
            searchValue: "ns.corporation.getCorporation().state",
            replaceValue: "ns.corporation.getCorporation().nextState",
          },
        },
      ],
      info:
        "ns.getTimeSinceLastAug was removed.\n" +
        'It has been automatically replaced with "Date.now() - ns.getResetInfo().lastAugReset".\n\n' +
        "ns.getPlayer().playtimeSinceLastAug was removed.\n" +
        'It has been automatically replaced with "Date.now() - ns.getResetInfo().lastAugReset".\n\n' +
        "ns.getPlayer().playtimeSinceLastBitnode was removed.\n" +
        'It has been automatically replaced with "Date.now() - ns.getResetInfo().lastNodeReset".\n\n' +
        "ns.getPlayer().bitNodeN was removed.\n" +
        'It has been automatically replaced with "ns.getResetInfo().currentNode"\n\n' +
        "ns.corporation.getCorporation().state was removed.\n" +
        'It has been automatically replaced with "ns.corporation.getCorporation().nextState"',
      showWarning: false,
    },
    {
      brokenAPIs: [
        { name: "ns.formatNumber", migration: { searchValue: "ns.formatNumber", replaceValue: "ns.format.number" } },
        { name: "ns.formatRam", migration: { searchValue: "ns.formatRam", replaceValue: "ns.format.ram" } },
        { name: "ns.formatPercent", migration: { searchValue: "ns.formatPercent", replaceValue: "ns.format.percent" } },
        { name: "ns.tFormat", migration: { searchValue: "ns.tFormat", replaceValue: "ns.format.time" } },
      ],
      info:
        "The formatting functions have been moved to their own interface, ns.format.\n" +
        "Each function has been replaced with their corresponding interface variant.\n" +
        "Additionally, the naming of ns.tFormat has been changed to ns.format.time.",
      showWarning: false,
    },
    {
      brokenAPIs: [
        { name: "ns.tail", migration: { searchValue: "ns.tail", replaceValue: "ns.ui.openTail" } },
        { name: "ns.moveTail", migration: { searchValue: "ns.moveTail", replaceValue: "ns.ui.moveTail" } },
        { name: "ns.resizeTail", migration: { searchValue: "ns.resizeTail", replaceValue: "ns.ui.resizeTail" } },
        { name: "ns.closeTail", migration: { searchValue: "ns.closeTail", replaceValue: "ns.ui.closeTail" } },
        { name: "ns.setTitle", migration: { searchValue: "ns.setTitle", replaceValue: "ns.ui.setTailTitle" } },
      ],
      info:
        "ns.tail() was removed.\n" +
        'It has been automatically replaced with "ns.ui.openTail()".\n\n' +
        "ns.moveTail() was removed.\n" +
        'It has been automatically replaced with "ns.ui.moveTail()".\n\n' +
        "ns.resizeTail() was removed.\n" +
        'It has been automatically replaced with "ns.ui.resizeTail()".\n\n' +
        "ns.closeTail() was removed.\n" +
        'It has been automatically replaced with "ns.ui.closeTail()".\n\n' +
        "ns.setTitle() was removed.\n" +
        'It has been automatically replaced with "ns.ui.setTailTitle()".',
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.corporation.setAutoJobAssignment",
          migration: {
            searchValue: "setAutoJobAssignment",
            replaceValue: "setJobAssignment",
          },
        },
      ],
      info:
        "ns.corporation.setAutoJobAssignment() was removed.\n" +
        'It has been automatically replaced with "ns.corporation.setJobAssignment()".',
      showWarning: false,
    },
    {
      brokenAPIs: [],
      info:
        "With some APIs, when you passed values to their params, you could pass a value that was not an exact match. " +
        'For example, with ns.singularity.commitCrime, you could pass "Rob Store", "rob store", "RobStore", "robstore", "robStore", etc. ' +
        'This is called "fuzzy matching". Now, you must pass an exact value (i.e., Rob Store). This change affects:\n' +
        "- Bladeburner action and type: BladeburnerActionType, BladeburnerGeneralActionName, BladeburnerContractName, BladeburnerOperationName, BladeburnerBlackOpName, SpecialBladeburnerActionTypeForSleeve, BladeburnerActionTypeForSleeve.\n" +
        "- Crime: CrimeType\n" +
        "- Faction work: FactionWorkType\n" +
        "- University class: UniversityClassType\n" +
        "- Gym stat: GymType\n" +
        "- Job field: JobField\n" +
        "- Stock position: PositionType\n" +
        "- Stock order: OrderType\n" +
        "You can access these values via ns.enums and Bladeburner APIs.",
      showWarning: true,
      doNotSkip: true,
    },
    {
      brokenAPIs: [
        { name: "ns.nuke" },
        { name: "ns.brutessh" },
        { name: "ns.ftpcrack" },
        { name: "ns.relaysmtp" },
        { name: "ns.httpworm" },
        { name: "ns.sqlinject" },
      ],
      info:
        `ns.nuke, ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, and ns.sqlinject now do not throw an error when you do not have the required .exe file or enough opened ports.\n` +
        "This should not be a problem with most scripts. However, if you were catching errors and branching on the result of success/failure, you will need to use the return value instead.",
      showWarning: true,
    },
    {
      brokenAPIs: [
        {
          name: "ns.stock.getConstants().WSEAccountCost",
          migration: { searchValue: "WSEAccountCost", replaceValue: "WseAccountCost" },
        },
        {
          name: "ns.stock.getConstants().TIXAPICost",
          migration: { searchValue: "TIXAPICost", replaceValue: "TixApiCost" },
        },
        {
          name: "ns.stock.hasWSEAccount",
          migration: { searchValue: "hasWSEAccount", replaceValue: "hasWseAccount" },
        },
        {
          name: "ns.stock.hasTIXAPIAccess",
          migration: { searchValue: "hasTIXAPIAccess", replaceValue: "hasTixApiAccess" },
        },
        {
          name: "ns.stock.has4SDataTIXAPI",
          migration: { searchValue: "has4SDataTIXAPI", replaceValue: "has4SDataTixApi" },
        },
      ],
      info:
        "ns.stock.getConstants().WSEAccountCost was removed.\n" +
        'It has been automatically replaced with "ns.stock.getConstants().WseAccountCost".\n\n' +
        "ns.stock.getConstants().TIXAPICost was removed.\n" +
        'It has been automatically replaced with "ns.stock.getConstants().TixApiCost".\n\n' +
        "ns.stock.hasWSEAccount() was removed.\n" +
        'It has been automatically replaced with "ns.stock.hasWseAccount()".\n\n' +
        "ns.stock.hasTIXAPIAccess() was removed.\n" +
        'It has been automatically replaced with "ns.stock.hasTixApiAccess()".\n\n' +
        "ns.stock.has4SDataTIXAPI() was removed.\n" +
        'It has been automatically replaced with "ns.stock.has4SDataTixApi()".',
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.getBitNodeMultipliers().RepToDonateToFaction",
          migration: { searchValue: "RepToDonateToFaction", replaceValue: "FavorToDonateToFaction" },
        },
      ],
      info:
        "ns.getBitNodeMultipliers().RepToDonateToFaction was removed.\n" +
        'It has been automatically replaced with "ns.getBitNodeMultipliers().FavorToDonateToFaction".',
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "getActionRepGain" }],
      info:
        "ns.bladeburner.getActionRepGain returned the average rank gain instead of the average reputation gain.\n" +
        "This bug was fixed. Please check your code to see if it still works as you expect.",
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.enums.FactionName.BachmanAssociates",
          migration: { searchValue: "BachmanAssociates", replaceValue: "BachmanAndAssociates" },
        },
      ],
      info:
        'The key of "Bachman & Associates" faction in the FactionName enum was renamed.\n' +
        '"ns.enums.FactionName.BachmanAssociates" has been automatically replaced with "ns.enums.FactionName.BachmanAndAssociates".',
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "DreamSense" }],
      info: 'The "DreamSense" upgrade was removed. The cost of that upgrade was refunded.',
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "dividendTax", migration: { searchValue: "dividendTax", replaceValue: "tributeModifier" } }],
      info:
        "ns.corporation.getCorporation().dividendTax was removed.\n" +
        'It has been automatically replaced with "ns.corporation.getCorporation().tributeModifier".',
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "Spring Water" }],
      info: 'The "Spring Water" industry was removed. The cost of all Spring Water divisions was refunded.',
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "VeChain" }],
      info: 'The "VeChain" upgrade was removed. The cost of that upgrade was refunded.',
      showWarning: false,
    },
    {
      brokenAPIs: [
        { name: "ns.hackAnalyzeThreads" },
        { name: "ns.hackAnalyze" },
        { name: "ns.hackAnalyzeSecurity" },
        { name: "ns.hackAnalyzeChance" },
        { name: "ns.growthAnalyze" },
        { name: "ns.growthAnalyzeSecurity" },
        { name: "ns.nuke" },
        { name: "ns.brutessh" },
        { name: "ns.ftpcrack" },
        { name: "ns.relaysmtp" },
        { name: "ns.httpworm" },
        { name: "ns.sqlinject" },
        { name: "ns.getServerMoneyAvailable" },
        { name: "ns.getServerSecurityLevel" },
        { name: "ns.getServerBaseSecurityLevel" },
        { name: "ns.getServerMinSecurityLevel" },
        { name: "ns.getServerRequiredHackingLevel" },
        { name: "ns.getServerMaxMoney" },
        { name: "ns.getServerGrowth" },
        { name: "ns.getServerNumPortsRequired" },
        { name: "ns.deleteServer" },
        { name: "ns.getHackTime" },
        { name: "ns.getGrowTime" },
        { name: "ns.getWeakenTime" },
      ],
      info:
        "Some APIs returned a default value when you passed the hostname of a non-hackable server (e.g., hacknet " +
        "server) to them.\nThese APIs now throw an error. The affected APIs are:\n" +
        "- ns.hackAnalyzeThreads\n" +
        "- ns.hackAnalyze\n" +
        "- ns.hackAnalyzeSecurity\n" +
        "- ns.hackAnalyzeChance\n" +
        "- ns.growthAnalyze\n" +
        "- ns.growthAnalyzeSecurity\n" +
        "- ns.nuke\n" +
        "- ns.brutessh\n" +
        "- ns.ftpcrack\n" +
        "- ns.relaysmtp\n" +
        "- ns.httpworm\n" +
        "- ns.sqlinject\n" +
        "- ns.getServerMoneyAvailable\n" +
        "- ns.getServerSecurityLevel\n" +
        "- ns.getServerBaseSecurityLevel\n" +
        "- ns.getServerMinSecurityLevel\n" +
        "- ns.getServerRequiredHackingLevel\n" +
        "- ns.getServerMaxMoney\n" +
        "- ns.getServerGrowth\n" +
        "- ns.getServerNumPortsRequired\n" +
        "- ns.cloud.deleteServer\n" +
        "- ns.getHackTime\n" +
        "- ns.getGrowTime\n" +
        "- ns.getWeakenTime\n",
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "Glock 18C",
          migration: { searchValue: "Glock 18C", replaceValue: convertV2GangEquipmentNames("Glock 18C") },
        },
        { name: "P90C", migration: { searchValue: "P90C", replaceValue: convertV2GangEquipmentNames("P90C") } },
        {
          name: "Steyr AUG",
          migration: { searchValue: "Steyr AUG", replaceValue: convertV2GangEquipmentNames("Steyr AUG") },
        },
        { name: "AK-47", migration: { searchValue: "AK-47", replaceValue: convertV2GangEquipmentNames("AK-47") } },
        {
          name: "M15A10 Assault Rifle",
          migration: {
            searchValue: "M15A10 Assault Rifle",
            replaceValue: convertV2GangEquipmentNames("M15A10 Assault Rifle"),
          },
        },
        {
          name: "AWM Sniper Rifle",
          migration: { searchValue: "AWM Sniper Rifle", replaceValue: convertV2GangEquipmentNames("AWM Sniper Rifle") },
        },
        {
          name: "Ford Flex V20",
          migration: { searchValue: "Ford Flex V20", replaceValue: convertV2GangEquipmentNames("Ford Flex V20") },
        },
        {
          name: "ATX1070 Superbike",
          migration: {
            searchValue: "ATX1070 Superbike",
            replaceValue: convertV2GangEquipmentNames("ATX1070 Superbike"),
          },
        },
        {
          name: "Mercedes-Benz S9001",
          migration: {
            searchValue: "Mercedes-Benz S9001",
            replaceValue: convertV2GangEquipmentNames("Mercedes-Benz S9001"),
          },
        },
        {
          name: "White Ferrari",
          migration: { searchValue: "White Ferrari", replaceValue: convertV2GangEquipmentNames("White Ferrari") },
        },
      ],
      info:
        "Some gang equipments were renamed.\n" +
        `- "Glock 18C" was renamed to "${convertV2GangEquipmentNames("Glock 18C")}".\n` +
        `- "P90C" was renamed to "${convertV2GangEquipmentNames("P90C")}".\n` +
        `- "Steyr AUG" was renamed to "${convertV2GangEquipmentNames("Steyr AUG")}".\n` +
        `- "AK-47" was renamed to "${convertV2GangEquipmentNames("AK-47")}".\n` +
        `- "M15A10 Assault Rifle" was renamed to "${convertV2GangEquipmentNames("M15A10 Assault Rifle")}".\n` +
        `- "AWM Sniper Rifle" was renamed to "${convertV2GangEquipmentNames("AWM Sniper Rifle")}".\n` +
        `- "Ford Flex V20" was renamed to "${convertV2GangEquipmentNames("Ford Flex V20")}".\n` +
        `- "ATX1070 Superbike" was renamed to "${convertV2GangEquipmentNames("ATX1070 Superbike")}".\n` +
        `- "Mercedes-Benz S9001" was renamed to "${convertV2GangEquipmentNames("Mercedes-Benz S9001")}".\n` +
        `- "White Ferrari" was renamed to "${convertV2GangEquipmentNames("White Ferrari")}".\n`,
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "purchase4SMarketData" }],
      info:
        "You have to purchase a WSE account before purchasing 4S Market Data UI access via ns.stock.purchase4SMarketData().\n" +
        "Note that this change does not affect 4S Market Data TIX API access (ns.stock.purchase4SMarketDataTixApi()).",
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.getPurchasedServerCost",
          migration: { searchValue: "ns.getPurchasedServerCost", replaceValue: "ns.cloud.getServerCost" },
        },
        {
          name: "ns.purchaseServer",
          migration: { searchValue: "ns.purchaseServer", replaceValue: "ns.cloud.purchaseServer" },
        },
        {
          name: "ns.getPurchasedServerUpgradeCost",
          migration: {
            searchValue: "ns.getPurchasedServerUpgradeCost",
            replaceValue: "ns.cloud.getServerUpgradeCost",
          },
        },
        {
          name: "ns.upgradePurchasedServer",
          migration: { searchValue: "ns.upgradePurchasedServer", replaceValue: "ns.cloud.upgradeServer" },
        },
        {
          name: "ns.renamePurchasedServer",
          migration: { searchValue: "ns.renamePurchasedServer", replaceValue: "ns.cloud.renameServer" },
        },
        {
          name: "ns.deleteServer",
          migration: { searchValue: "ns.deleteServer", replaceValue: "ns.cloud.deleteServer" },
        },
        {
          name: "ns.getPurchasedServers",
          migration: { searchValue: "ns.getPurchasedServers", replaceValue: "ns.cloud.getServerNames" },
        },
        {
          name: "ns.getPurchasedServerLimit",
          migration: { searchValue: "ns.getPurchasedServerLimit", replaceValue: "ns.cloud.getServerLimit" },
        },
        {
          name: "ns.getPurchasedServerMaxRam",
          migration: { searchValue: "ns.getPurchasedServerMaxRam", replaceValue: "ns.cloud.getRamLimit" },
        },
      ],
      info:
        "The cloud server (purchased server) functions have been moved to their own interface, ns.cloud.\n" +
        '"ns.getPurchasedServerCost()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.getServerCost()"\n\n' +
        '"ns.purchaseServer()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.purchaseServer()"\n\n' +
        '"ns.getPurchasedServerUpgradeCost()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.getServerUpgradeCost()"\n\n' +
        '"ns.upgradePurchasedServer()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.upgradeServer()"\n\n' +
        '"ns.renamePurchasedServer()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.renameServer()"\n\n' +
        '"ns.deleteServer()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.deleteServer()"\n\n' +
        '"ns.getPurchasedServers()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.getServerNames()"\n\n' +
        '"ns.getPurchasedServerLimit()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.getServerLimit()"\n\n' +
        '"ns.getPurchasedServerMaxRam()" was removed.\n' +
        'It has been automatically replaced with "ns.cloud.getRamLimit()"',
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.getBitNodeMultipliers().PurchasedServerCost",
          migration: {
            searchValue: "PurchasedServerCost",
            replaceValue: "CloudServerCost",
          },
        },
        {
          name: "ns.getBitNodeMultipliers().PurchasedServerSoftcap",
          migration: {
            searchValue: "PurchasedServerSoftcap",
            replaceValue: "CloudServerSoftcap",
          },
        },
        {
          name: "ns.getBitNodeMultipliers().PurchasedServerLimit",
          migration: {
            searchValue: "PurchasedServerLimit",
            replaceValue: "CloudServerLimit",
          },
        },
        {
          name: "ns.getBitNodeMultipliers().PurchasedServerMaxRam",
          migration: {
            searchValue: "PurchasedServerMaxRam",
            replaceValue: "CloudServerMaxRam",
          },
        },
      ],
      info:
        "ns.getBitNodeMultipliers() Purchased Server properties have been renamed to CloudServers with the creation of the cloud API.\n" +
        '"ns.getBitNodeMultipliers().PurchasedServerCost" was removed.\n' +
        'It has been automatically replaced with "ns.getBitNodeMultipliers().CloudServerCost".\n\n' +
        '"ns.getBitNodeMultipliers().PurchasedServerSoftcap" was removed.\n' +
        'It has been automatically replaced with "ns.getBitNodeMultipliers().CloudServerSoftcap".\n\n' +
        '"ns.getBitNodeMultipliers().PurchasedServerLimit" was removed.\n' +
        'It has been automatically replaced with "ns.getBitNodeMultipliers().CloudServerLimit".\n\n' +
        '"ns.getBitNodeMultipliers().PurchasedServerMaxRam" was removed.\n' +
        'It has been automatically replaced with "ns.getBitNodeMultipliers().CloudServerMaxRam".',
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "createDummyContract",
          migration: {
            searchValue: "createDummyContract",
            migrator: (line: string) => {
              for (const match of line.matchAll(/createDummyContract\([^,]*?\)/g)) {
                line = line.replace(match[0], match[0].slice(0, match[0].length - 1) + `, "home")`);
              }
              return line;
            },
          },
        },
      ],
      info:
        "ns.codingcontract.createDummyContract might generate a contract with the same name of another contract.\n" +
        "This bug was fixed. Now this function will return null and not generate a contract if the randomized contract " +
        "name is the same as another contract's name.\n\n" +
        "ns.codingcontract.createDummyContract generated a dummy contract on home. Now you can specify the host that \n" +
        'gets the generated contract with a new optional parameter. Your code was migrated to specify "home" as the host.',
      showWarning: false,
    },
    {
      brokenAPIs: [
        { name: "ns.go.analysis.getValidMoves" },
        { name: "ns.go.analysis.getChains" },
        { name: "ns.go.analysis.getLiberties" },
        { name: "ns.go.analysis.getControlledEmptyNodes" },
      ],
      info: "ns.go.analysis methods no longer apply captures to custom board states passed to them, and instead evaluate the given board exactly as-is.",
      showWarning: false,
    },
    {
      brokenAPIs: [],
      info:
        `We added a new feature called Dark Net. The "darkweb" server is a darknet server now.\n` +
        "Some APIs that require the target host to be a normal server do not work with darkweb. This should not be a \n" +
        `problem with most scripts. The most potentially affected API is "ns.scan()". Darkweb does not appear in the \n` +
        `result of this API anymore. If you want to find darknet servers, you need to use "ns.dnet.probe()".`,
      showWarning: false,
      doNotSkip: true,
    },
    {
      brokenAPIs: [
        { name: "ns.hacknet.numNodes" },
        { name: "ns.hacknet.purchaseNode" },
        { name: "ns.hacknet.getPurchaseNodeCost" },
        { name: "ns.hacknet.getNodeStats" },
        { name: "ns.hacknet.upgradeLevel" },
        { name: "ns.hacknet.upgradeRam" },
        { name: "ns.hacknet.upgradeCore" },
        { name: "ns.hacknet.upgradeCache" },
        { name: "ns.hacknet.getLevelUpgradeCost" },
        { name: "ns.hacknet.getRamUpgradeCost" },
        { name: "ns.hacknet.getCoreUpgradeCost" },
        { name: "ns.hacknet.getCacheUpgradeCost" },
        { name: "ns.hacknet.numHashes" },
        { name: "ns.hacknet.hashCost" },
        { name: "ns.hacknet.spendHashes" },
        { name: "ns.hacknet.maxNumNodes" },
        { name: "ns.hacknet.hashCapacity" },
        { name: "ns.hacknet.getHashUpgrades" },
        { name: "ns.hacknet.getHashUpgradeLevel" },
        { name: "ns.hacknet.getStudyMult" },
        { name: "ns.hacknet.getTrainingMult" },
      ],
      info:
        "Accessing the hacknet namespace incurred a one-time cost of 4 GB of RAM, and each hacknet API did not incur \n" +
        "RAM cost. Now the hacknet namespace does not incur RAM cost, but each hacknet API incurs a 0.5GB RAM cost.",
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "ns.sleeve.travel" }],
      info: "ns.sleeve.travel() did not cancel the sleeve's current task. It does now.",
      showWarning: false,
    },
    {
      brokenAPIs: [{ name: "ns.cloud.purchaseServer" }, { name: "ns.cloud.deleteServer" }],
      info:
        "ns.cloud.purchaseServer() and ns.cloud.deleteServer() previously removed whitespace from the provided hostname inconsistently.\n" +
        "They now use the hostname as provided.",
      showWarning: false,
    },
    {
      brokenAPIs: [
        { name: "ns.codingcontract.attempt" },

        { name: "FindAllValidMathExpressions" },
        { name: "GenerateIPAddresses" },
        { name: "LargestRectangleInAMatrix" },
        { name: "MergeOverlappingIntervals" },
        { name: "Proper2ColoringOfAGraph" },
        { name: "SanitizeParenthesesInExpression" },
        { name: "SpiralizeMatrix" },

        { name: "Find All Valid Math Expressions" },
        { name: "Generate IP Addresses" },
        { name: "Largest Rectangle in a Matrix" },
        { name: "Merge Overlapping Intervals" },
        { name: "Proper 2-Coloring of a Graph" },
        { name: "Sanitize Parentheses in Expression" },
        { name: "Spiralize Matrix" },
      ],
      info:
        "If you pass a string to ns.codingcontract.attempt() for contracts that require a non-string answer, the\n" +
        "game will convert that string to the expected format. This string conversion was inconsistent and had many\n" +
        `undocumented behaviors. Now the rules are consistent and well-documented. Please check the "Coding Contracts"\n` +
        "page for more information.\n" +
        "There are 7 contracts that are affected by this change:\n" +
        "- Find All Valid Math Expressions\n" +
        "- Generate IP Addresses\n" +
        "- Largest Rectangle in a Matrix\n" +
        "- Merge Overlapping Intervals\n" +
        "- Proper 2-Coloring of a Graph\n" +
        "- Sanitize Parentheses in Expression\n" +
        "- Spiralize Matrix\n" +
        "Note that this change only affects the string conversion. The solution format of these contracts is an array,\n" +
        "so if you pass the solution, which is an array, as is, you will not have any problems.\n" +
        `If your code converts the array to a string, you should check these contracts, especially the "Sanitize\n` +
        `Parentheses in Expression" contract and others that require a string array.\n` +
        `- Sanitize Parentheses in Expression: Previously, if you passed an empty string to this contract, it was\n` +
        "converted to an array containing an empty string. Now, it's converted to an empty array.\n" +
        `- Read the "General rules", "String conversion", and "Tips" sections on the "Coding Contracts" page carefully.`,
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.gang.getOtherGangInformation",
          migration: {
            searchValue: "getOtherGangInformation",
            replaceValue: "getAllGangInformation",
          },
        },
      ],
      info:
        "ns.gang.getOtherGangInformation() was renamed to ns.gang.getAllGangInformation().\n" +
        "The function was renamed because it returns information about all gangs, including the player's own gang.",
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "ns.singularity.getCurrentWork",
          migration: {
            searchValue: "completion",
            /**
             * "completion" is a common word, so we cannot replace all its instances.
             * This migrator focuses on the most popular use cases of the "completion" promise. It intentionally does
             * not support complex cases and `completion.then()`.
             */
            migrator: (line: string) => {
              // Direct chaining from API
              // Use \b:
              // - The leading \b applies to getCurrentWork, preventing prefixes like foo_getCurrentWork
              // - The trailing \b applies to completion, preventing suffixes like completionFoo.
              // Use \s* to match `getCurrentWork ( ) .completion`
              line = line.replace(/\b(getCurrentWork\s*\(\s*\))\s*\.completion\b/g, "$1.nextCompletion");

              // Awaited property access (`await task.completion`). This is a bit risky, but it's still a common usage.
              // [a-zA-Z0-9_$.[\]()?]+ is enough to catch common usages.
              line = line.replace(/(\bawait\s+[a-zA-Z0-9_$.[\]()?]+)\s*\.completion\b/g, "$1.nextCompletion");

              return line;
            },
          },
        },
        { name: "ns.sleeve.getTask" },
      ],
      info:
        "Task objects returned from ns.singularity.getCurrentWork() and ns.sleeve.getTask() previously had an optional\n" +
        `promise property named either "completion" or "nextCompletion", depending on the task.\n` +
        `Now, these task objects always include this property, and it is consistently named "nextCompletion".`,
      showWarning: false,
    },
  ],
};
