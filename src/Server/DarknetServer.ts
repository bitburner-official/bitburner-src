import { DnetServer } from "../DarkNet/models/DarknetServerData";
import { Icon, labIcon } from "../DarkNet/ui/ServerIcon";
import { Minigames } from "../DarkNet/controllers/ServerGenerator";
import { BaseServer, IConstructorParams } from "./BaseServer";
import { constructorsForReviver, IReviverValue } from "../utils/JSONReviver";

export type IDarknetServer = {
  /** Hostname. Must be unique */
  hostname: string;
  /** IP Address. Must be unique */
  ip: string;
  /** Flag indicating whether player has admin/root access to this server */
  hasAdminRights: boolean;
  /** Flag indicating whether player is currently connected to this server */
  isConnectedTo: boolean;
  /** RAM (GB) used. i.e. unavailable RAM */
  ramUsed: number;
  /** RAM (GB) available on this server */
  maxRam: number;
  /** Name of company/faction/etc. that this server belongs to, not applicable to all Servers */
  organizationName: string;
  /** Flag indicating whether this is a purchased server */
  purchasedByPlayer: boolean;
  /** Flag indicating whether this server has a backdoor installed by a player */
  backdoorInstalled?: boolean;
  /** If the server has a stasis link applied */
  hasStasisLink: boolean;
  /** The amount of ram blocked by the server owner */
  ramBlock: number;
  /** The model of the server. Similar models have similar vulnerabilites. */
  modelId: Minigames;
  /** The generic password prompt for the server */
  staticPasswordHint: string;
  /** Data associated with the password hint */
  passwordHintData?: string;
  /** The difficulty rating of the server, associated with its original depth in the net */
  difficulty: number;
  /** The depth of the server in the net */
  x: number;
  /** The charisma skill required to heartbleed the server */
  requiredCharismaSkill: number;
};

export class DarknetServer extends BaseServer implements IDarknetServer, DnetServer {
  icon: Icon | typeof labIcon;
  password: string;
  modelId: Minigames;
  staticPasswordHint: string;
  passwordHintData?: string;
  difficulty: number;
  x: number;
  y: number;
  hasStasisLink: boolean;
  ramBlock: number;
  logTrafficInterval: number;
  requiredCharismaSkill: number;

  constructor(props?: IConstructorParams & DnetServer) {
    super(props);
    this.icon = props?.icon || labIcon;
    this.password = props?.password || "";
    this.modelId = props?.modelId || "ZeroLogon";
    this.staticPasswordHint = props?.staticPasswordHint || "";
    this.passwordHintData = props?.passwordHintData;
    this.difficulty = props?.difficulty || 0;
    this.x = props?.x || 0;
    this.y = props?.y || 0;
    this.hasStasisLink = props?.hasStasisLink || false;
    this.ramBlock = props?.ramBlock || 0;
    this.logTrafficInterval = props?.logTrafficInterval || 0;
    this.requiredCharismaSkill = props?.requiredCharismaSkill || 0;
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

export const exampleDarknetServer: IDarknetServer = {
  backdoorInstalled: false,
  difficulty: 0,
  hasStasisLink: false,
  modelId: "",
  passwordHintData: "",
  ramBlock: 0,
  requiredCharismaSkill: 0,
  staticPasswordHint: "",
  x: 0,
  hostname: "",
  ip: "",
  hasAdminRights: false,
  isConnectedTo: false,
  ramUsed: 0,
  maxRam: 0,
  organizationName: "",
  purchasedByPlayer: false,
};
