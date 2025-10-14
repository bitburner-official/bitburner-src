import { Icon, labIcon } from "../DarkNet/ui/ServerIcon";
import { BaseServer } from "./BaseServer";
import { constructorsForReviver, IReviverValue } from "../utils/JSONReviver";
import type { DarknetServerData } from "@nsdefs";
import { exampleDarknetServerData } from "../DarkNet/Enums";
import { createRandomIp } from "../utils/IPAddress";
import type { CacheFilePath } from "../Paths/CacheFilePath";
import type { IPAddress } from "../Types/strings";

export interface DarknetServerConstructorParams {
  // Properties of BaseServer
  hostname: string;
  ip: IPAddress;
  maxRam: number;
  // Properties of DarknetServer
  icon: Icon | typeof labIcon;
  password: string;
  modelId: string;
  staticPasswordHint: string;
  passwordHintData: string;
  difficulty: number;
  depth: number;
  leftOffset: number;
  hasStasisLink: boolean;
  ramBlock: number;
  logTrafficInterval: number;
  requiredCharismaSkill: number;
  isMobile: boolean;
}

export class DarknetServer extends BaseServer implements DarknetServerData {
  // Override the optional "backdoorInstalled" property in BaseServer
  backdoorInstalled: boolean = false;

  /** Random reward caches on this server */
  caches: CacheFilePath[] = [];
  /** The icon of the server, used for display */
  icon: Icon | typeof labIcon;
  /** The password for the server, used for authentication */
  password: string;
  /** The model of the server. Similar models have similar vulnerabilities. */
  modelId: string;
  /** The generic password prompt for the server */
  staticPasswordHint: string;
  /** Data associated with the password hint */
  passwordHintData: string;
  /** The difficulty rating of the server, associated with its original depth in the net */
  difficulty: number;
  /** The depth of the server in the net */
  depth: number;
  /** The left offset of the server in the net */
  leftOffset: number;
  /** If the server has a stasis link applied */
  hasStasisLink: boolean;
  /** The amount of ram blocked by the server owner */
  ramBlock: number;
  /** The interval at which the server logs traffic */
  logTrafficInterval: number;
  /** The charisma skill required to heartbleed the server */
  requiredCharismaSkill: number;
  /** If this darknet server can move. False for fixed/story servers. */
  isMobile: boolean;

  constructor(
    params: DarknetServerConstructorParams = {
      ...exampleDarknetServerData,
      ip: createRandomIp(),
      icon: Icon.Terminal,
      password: "",
      leftOffset: 0,
      isMobile: true,
    },
  ) {
    super(params);
    this.icon = params.icon;
    this.password = params.password;
    this.modelId = params.modelId;
    this.maxRam = params.maxRam;
    this.staticPasswordHint = params.staticPasswordHint;
    this.passwordHintData = params.passwordHintData;
    this.difficulty = params.difficulty;
    this.depth = params.depth;
    this.leftOffset = params.leftOffset;
    this.hasStasisLink = params.hasStasisLink;
    this.ramBlock = params.ramBlock;
    this.logTrafficInterval = params.logTrafficInterval;
    this.requiredCharismaSkill = params.requiredCharismaSkill;
    this.isMobile = params.isMobile;
  }

  toJSON(): IReviverValue {
    return this.toJSONBase("DarknetServer", includedKeys);
  }

  static fromJSON(value: IReviverValue): DarknetServer {
    return BaseServer.fromJSONBase(value, DarknetServer, includedKeys);
  }
}

const includedKeys = BaseServer.getIncludedKeys(DarknetServer);
constructorsForReviver.DarknetServer = DarknetServer;
