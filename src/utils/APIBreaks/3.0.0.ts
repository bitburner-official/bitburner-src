import { APIBreakInfo } from "./APIBreak";

export const breakInfos300: APIBreakInfo[] = [
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
      'It has been automatically replaced with "ns.ui.setTailTitle()".\n\n',
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
      'It has been automatically replaced with "ns.corporation.setJobAssignment()".\n\n',
    showPopUp: false,
  },
];
