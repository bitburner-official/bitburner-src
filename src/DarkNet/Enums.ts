import { _ValueOf, DarknetServer as IDarknetServer } from "@nsdefs";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;
export const NET_WIDTH = 8;
export const MAX_NET_DEPTH = 40;
export const SERVER_DENSITY = 0.7;
export const MS_PER_MUTATION_PER_ROW = 30_000; // 30 seconds

// each minigame needs to have a name that sounds like a device or browser or language model and version
// (This list is not exposed to the player; they find them through discovery)
export const ModelIds = {
  EchoVuln: "DeskMemo_3.1",
  SortedEchoVuln: "PHP 5.4",
  NoPassword: "ZeroLogon",
  Captcha: "CloudBlare(tm)",
  DefaultPassword: "FreshInstall_1.0",
  MastermindHint: "DeepGreen",
  TimingAttack: "2G_cellular",
  LargestPrimeFactor: "PrimeTime 2",
  RomanNumeral: "BellaCuore",
  DogNames: "Laika4",
  GuessNumber: "AccountsManager_4.2",
  CommonPasswordDictionary: "TopPass",
  EUCountryDictionary: "EuroZone Free",
  Yesn_t: "NIL",
  Synchronize: "",
  BinaryEncodedFeedback: "110100100",
  SpiceLevel: "RateMyPix.Auth",
  ConvertToBase10: "OctantVoxel",
  parsedExpression: "MathML",
  divisibilityTest: "ModuloTerm",
  packetSniffer: "OpenWebAccessPoint",
  labyrinth: "(The Labyrinth)",
} as const;

export type MinigamesType = _ValueOf<typeof ModelIds>;

export const ResponseStatus = {
  SUCCESS: "200 Success",
  AUTH_FAILURE: "401 Unauthorized",
  NOT_FOUND: "404 Not Found",
  TIMEOUT: "408 Request Timeout",
  MOVED_PERMANENTLY: "301 Moved Permanently",
  I_AM_A_TEAPOT: "418 I'm a teapot",
} as const;

export const exampleDarknetServer: IDarknetServer = {
  difficulty: 0,
  isOnline: true,
  hasAdminRights: false,
  hasStasisLink: false,
  hostname: "",
  ip: "",
  isConnectedTo: false,
  maxRam: 16,
  organizationName: "",
  purchasedByPlayer: false,
  ramBlock: 0,
  ramUsed: 0,
  requiredCharismaSkill: 0,
  staticPasswordHint: "",
  passwordHintData: "",
  depth: -1,
  modelId: "",
  logTrafficInterval: -1,
};
