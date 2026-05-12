import type { VersionBreakingChange } from "./APIBreak";

export const breakingChanges301: VersionBreakingChange = {
  apiBreakingChanges: [
    {
      brokenAPIs: [
        {
          name: "ns.dnet.getServerAuthDetails",
          migration: {
            searchValue: "getServerAuthDetails",
            replaceValue: "getServerDetails",
          },
        },
      ],
      info: "ns.dnet.getServerAuthDetails has been renamed to ns.dnet.getServerDetails",
      showWarning: false,
    },
  ],
};
