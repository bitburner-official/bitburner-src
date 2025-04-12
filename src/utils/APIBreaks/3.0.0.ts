import { APIBreakInfo } from "./APIBreak";

export const breakInfos300: APIBreakInfo[] = [
  {
    brokenFunctions: [{ name: "ns.nFormat" }],
    info:
      "ns.nFormat() was removed.\n" +
      "Use ns.formatNumber, ns.formatRam, ns.formatPercent, or JS built-in objects/functions (e.g., Intl.NumberFormat, " +
      "Intl.PluralRules, Intl.Locale) instead.",
  },
  {
    brokenFunctions: [
      { name: "ns.getTimeSinceLastAug()", replaceValue: "(Date.now() - ns.getResetInfo().lastAugReset)" },
    ],
    info: "ns.getTimeSinceLastAug() was removed.\n" + "Use Date.now() - ns.getResetInfo().lastAugReset instead.",
  },
  {
    brokenFunctions: [
      { name: "ns.getPlayer().playtimeSinceLastAug", replaceValue: "(Date.now() - ns.getResetInfo().lastAugReset)" },
    ],
    info:
      "ns.getPlayer().playtimeSinceLastAug was removed.\n" + "Use Date.now() - ns.getResetInfo().lastAugReset instead.",
  },
  {
    brokenFunctions: [
      {
        name: "ns.getPlayer().playtimeSinceLastBitnode",
        replaceValue: "(Date.now() - ns.getResetInfo().lastNodeReset)",
      },
    ],
    info:
      "ns.getPlayer().playtimeSinceLastBitnode was removed.\n" +
      "Use Date.now() - ns.getResetInfo().lastNodeReset instead.",
  },
  {
    brokenFunctions: [{ name: "ns.getPlayer().bitNodeN", replaceValue: "ns.getResetInfo().currentNode" }],
    info: "ns.getPlayer().bitNodeN was removed.\n" + "Use ns.getResetInfo().currentNode instead",
  },
  {
    brokenFunctions: [
      { name: "ns.corporation.getCorporation().state", replaceValue: "ns.corporation.getCorporation().nextState" },
    ],
    info:
      "ns.corporation.getCorporation().state was removed.\n" + "Use ns.corporation.getCorporation().nextState instead",
  },
];
