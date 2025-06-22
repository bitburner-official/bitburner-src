import type { VersionBreakingChange } from "./APIBreak";

export const breakingChanges300: VersionBreakingChange = {
  additionalText: "For more information, please check https://github.com/bitburner-official/bitburner-src/issues/2148.",
  apiBreakingChanges: [
    {
      brokenAPIs: [{ name: "ns.nFormat" }],
      info:
        "ns.nFormat() was removed.\n" +
        "Use ns.formatNumber, ns.formatRam, ns.formatPercent, or JS built-in objects/functions (e.g., Intl.NumberFormat, " +
        "Intl.PluralRules, Intl.Locale) instead.",
      showPopUp: true,
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
      showPopUp: false,
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
      showPopUp: false,
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
      showPopUp: false,
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
      showPopUp: false,
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
      showPopUp: true,
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
      showPopUp: true,
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
      showPopUp: false,
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
      showPopUp: false,
    },
    {
      brokenAPIs: [{ name: "getActionRepGain" }],
      info:
        "ns.bladeburner.getActionRepGain returned the average rank gain instead of the average reputation gain.\n" +
        "This bug was fixed. Please check your code to see if it still works as you expect.",
      showPopUp: false,
    },
  ],
};
