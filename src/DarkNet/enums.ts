// each minigame needs to have a name that sounds like a device or browser or language model and version
import { AugmentationName } from "@enums";
import { SpecialServers } from "../Server/data/SpecialServers";
import { DarknetServer as IDarknetServer } from "@nsdefs";

export const HORIZONTAL_CONNECTION_CHANCE = 0.5;
export const VERTICAL_CONNECTION_CHANCE = 0.3;
export const AIR_GAP_DEPTH = 8;
export const NET_WIDTH = 8;
export const MAX_NET_DEPTH = 40;
export const SERVER_DENSITY = 0.7;
export const MS_PER_MUTATION_PER_ROW = 30_000; // 30 seconds

export const Minigames = {
  EchoVuln: "DeskMemo_3.1",
  SortedEchoVuln: "PHP 5.4",
  NoPassword: "ZeroLogon",
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
  labyrinth: "_lab_",
} as const;

export type Minigames = (typeof Minigames)[keyof typeof Minigames];

export const ResponseStatus = {
  SUCCESS: "200 Success",
  AUTH_FAILURE: "401 Unauthorized",
  NOT_FOUND: "404 Not Found",
  TIMEOUT: "408 Request Timeout",
  MOVED_PERMANENTLY: "301 Moved Permanently",
  I_AM_A_TEAPOT: "418 I'm a teapot",
} as const;

export type ResponseStatus = (typeof ResponseStatus)[keyof typeof ResponseStatus];

type labDetails = {
  name: string;
  depth: number;
  cha: number;
  augReward: AugmentationName;
  mazeWidth: number;
  mazeHeight: number;
  manual: boolean;
};

export const labData: Record<string, labDetails> = {
  [SpecialServers.NormalLab]: {
    name: SpecialServers.NormalLab,
    depth: 7,
    cha: 300,
    augReward: AugmentationName.TheBrokenWings,
    mazeWidth: 20,
    mazeHeight: 14,
    manual: true,
  },
  [SpecialServers.CruelLab]: {
    name: SpecialServers.CruelLab,
    depth: 12,
    cha: 600,
    augReward: AugmentationName.TheBoots,
    mazeWidth: 30,
    mazeHeight: 20,
    manual: true,
  },
  [SpecialServers.MercilessLab]: {
    name: SpecialServers.MercilessLab,
    depth: 19,
    cha: 1500,
    augReward: AugmentationName.TheHammer,
    mazeWidth: 40,
    mazeHeight: 26,
    manual: false,
  },
  [SpecialServers.UberLab]: {
    name: SpecialServers.UberLab,
    depth: 23,
    cha: 2500,
    augReward: AugmentationName.TheRedPill,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.EternalLab]: {
    name: SpecialServers.EternalLab,
    depth: 29,
    cha: 2800,
    augReward: AugmentationName.TheLaw,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
  [SpecialServers.FinalLab]: {
    name: SpecialServers.FinalLab,
    depth: 31,
    cha: 3200,
    augReward: AugmentationName.TheSword,
    mazeWidth: 60,
    mazeHeight: 40,
    manual: false,
  },
} as const;

export const exampleDarknetServer: IDarknetServer = {
  difficulty: 0,
  hasAdminRights: false,
  hasStasisLink: false,
  hostname: "darkweb",
  ip: "",
  isConnectedTo: false,
  maxRam: 16,
  organizationName: "",
  purchasedByPlayer: false,
  ramBlock: 0,
  ramUsed: 0,
  requiredCharismaSkill: 0,
  staticPasswordHint: "The passkey is 'leekspin'",
  passwordHintData: "leekspin",
  depth: -1,
  modelId: "DeskMemo_3.1",
  logTrafficInterval: -1,
};
