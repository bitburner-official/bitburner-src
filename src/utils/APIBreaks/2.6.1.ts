import { APIBreakInfo } from "./APIBreak";

export const breakInfos261: APIBreakInfo[] = [
  {
    brokenFunctions: ["ns.bladeburner.getCurrentAction"],
    info:
      "ns.bladeburner.getCurrentAction:\n" +
      'When not performing a bladeburner action, previously returned {type: "Idle", name: ""}, now returns null.\n' +
      "Because of this change, the null case now needs to be dealt with prior to accessing properties on the return of getCurrentAction, including destructuring.\n" +
      "Additionally, any existing code for filtering out the Idle case will need to be adjusted.\n\n" +
      "See https://github.com/bitburner-official/bitburner-src/issues/1249 or PR https://github.com/bitburner-official/bitburner-src/pull/1248 for more details.",
  },
  {
    brokenFunctions: [
      "ns.bladeburner.getActionCountRemaining",
      "ns.bladeburner.getActionEstimatedSuccessChance",
      "ns.bladeburner.getActionTime",
    ],
    info:
      "ns.bladeburner.getActionCountRemaining:\n" +
      'Previously returned -1 when called with type "Idle" and name "". This is no longer valid usage and will result in an error.\n\n' +
      "ns.bladeburner.getActionEstimatedSuccessChance:\n" +
      'Previously returned [-1, -1] when called with type "Idle" and name "". This is no longer valid usage and will result in an error.\n\n' +
      "ns.bladeburner.getActionTime:\n" +
      'Previously returned -1 when called with type "Idle" and name "". This is no longer valid usage and will result in an error.\n\n' +
      "See the related changes for ns.bladeburner.getCurrentAction, which were shown earlier in these API break details.\n" +
      "In most cases, the fixes for ns.bladeburner.getCurrentAction will fix this group of isses as well.",
  },
];
