import type { VersionBreakingChange } from "./APIBreak";

export const breakingChanges302: VersionBreakingChange = {
  apiBreakingChanges: [
    {
      brokenAPIs: [
        {
          name: "ns.singularity.exportGameBonus",
          migration: {
            searchValue: "exportGameBonus",
            replaceValue: "hasExportGameBonus",
          },
        },
      ],
      info:
        "ns.singularity.exportGameBonus() is deprecated and will be removed in a later version.\n" +
        "Use ns.singularity.hasExportGameBonus() instead.",
      showWarning: false,
    },
    {
      brokenAPIs: [
        {
          name: "getServerDetails",
        },
      ],
      info: "ns.dnet.getServerDetails() now returns the visible depth of the darknet lab server, instead of -1.",
      showWarning: true,
    },
  ],
};
