import type { _ValueOf, DarknetServerDetails } from "@nsdefs";
import type { DarknetServerData } from "./utils/darknetServerUtils";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;
export const NET_WIDTH = 8;
export const MAX_NET_DEPTH = 40;
export const SERVER_DENSITY = 0.6;
export const LOW_LEVEL_SERVER_DENSITY = 0.7;
export const MS_PER_MUTATION_PER_ROW = 30_000; // 30 seconds

// each minigame needs to have a name that sounds like a device or browser or language model and version
// (This list is not exposed to the player; they find them through discovery)
export const ModelIds = {
  EchoVuln: "DeskMemo_3.1",
  SortedEchoVuln: "PHP 5.4",
  NoPassword: "ZeroLogon",
  Captcha: "CloudBlare(tm)",
  DefaultPassword: "FreshInstall_1.0",
  BufferOverflow: "Pr0verFl0",
  MastermindHint: "DeepGreen",
  TimingAttack: "2G_cellular",
  LargestPrimeFactor: "PrimeTime 2",
  RomanNumeral: "BellaCuore",
  DogNames: "Laika4",
  GuessNumber: "AccountsManager_4.2",
  CommonPasswordDictionary: "TopPass",
  EUCountryDictionary: "EuroZone Free",
  Yesn_t: "NIL",
  BinaryEncodedFeedback: "110100100",
  SpiceLevel: "RateMyPix.Auth",
  ConvertToBase10: "OctantVoxel",
  parsedExpression: "MathML",
  divisibilityTest: "Factori-Os",
  tripleModulo: "BigMo%od",
  globalMaxima: "KingOfTheHill",
  packetSniffer: "OpenWebAccessPoint",
  encryptedPassword: "OrdoXenos",
  labyrinth: "(The Labyrinth)",
} as const;

export type MinigamesType = _ValueOf<typeof ModelIds>;

export const GenericResponseMessage = {
  Success: "Success",
  DirectConnectionRequired: "Direct Connection Required",
  AuthFailure: "Unauthorized",
  NotFound: "Not Found",
  RequestTimeOut: "Request Timeout",
  NotEnoughCharisma: "Not Enough Charisma",
  StasisLinkLimitReached: "Stasis Link Limit Reached",
  NoBlockRAM: "No Host-owned RAM Left To Reallocate",
  ServiceUnavailable: "Service Unavailable",
} as const;

export const ResponseCodeEnum = {
  Success: 200,
  DirectConnectionRequired: 351,
  AuthFailure: 401,
  Forbidden: 403,
  NotFound: 404,
  RequestTimeOut: 408,
  NotEnoughCharisma: 451,
  StasisLinkLimitReached: 453,
  NoBlockRAM: 454,
  PhishingFailed: 455,
  ServiceUnavailable: 503,
} as const;

export const exampleDarknetServerData = {
  hostname: "",
  ip: "",
  hasAdminRights: false,
  isConnectedTo: false,
  cpuCores: 1,
  ramUsed: 0,
  maxRam: 0,
  backdoorInstalled: false,
  hasStasisLink: false,
  blockedRam: 0,
  modelId: "",
  staticPasswordHint: "",
  passwordHintData: "",
  difficulty: 0,
  depth: -1,
  requiredCharismaSkill: 0,
  logTrafficInterval: -1,
  isStationary: false,
  purchasedByPlayer: false,
} as const satisfies DarknetServerData;

export const exampleDarknetServerDetails = {
  isConnectedToCurrentServer: false,
  hasSession: false,
  modelId: exampleDarknetServerData.modelId,
  passwordHint: exampleDarknetServerData.staticPasswordHint,
  data: exampleDarknetServerData.passwordHintData,
  logTrafficInterval: exampleDarknetServerData.logTrafficInterval,
  passwordLength: -1,
  passwordFormat: "numeric",
  blockedRam: exampleDarknetServerData.blockedRam,
  difficulty: exampleDarknetServerData.difficulty,
  requiredCharismaSkill: exampleDarknetServerData.requiredCharismaSkill,
  depth: exampleDarknetServerData.depth,
  isStationary: exampleDarknetServerData.isStationary,
} as const satisfies DarknetServerDetails;
