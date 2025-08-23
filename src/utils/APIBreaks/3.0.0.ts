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
        "- ns.deleteServer\n" +
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
  ],
};
